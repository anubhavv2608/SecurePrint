// backend/index.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
import multer from "multer";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { UsersColl, FilesColl, LinksColl, toObjectId } from "./models.js";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
const LINK_TTL_SECONDS = Number(process.env.LINK_TTL_SECONDS || 300);

if (!MONGO_URI) throw new Error("MONGO_URI required in .env");

// ---- MongoDB connection ----
const client = new MongoClient(MONGO_URI, { maxPoolSize: 10 });
await client.connect();
const db = client.db();
const bucket = new GridFSBucket(db, { bucketName: "files" });

const users = UsersColl(db);
const filesMeta = FilesColl(db);
const links = LinksColl(db);

// ---- Nodemailer (Gmail App Password) ----
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify SMTP
transporter.verify((error) => {
  if (error) {
    console.error("❌ SMTP connection failed:", error);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
});

// ---- Middleware ----
function authMiddleware(req, res, next) {
  const h = req.headers.authorization;
  if (!h) return res.status(401).json({ error: "Unauthorized" });
  const token = h.split(" ")[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// ---- AUTH ----
app.post("/api/auth/signup", async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: "email+password required" });

  const existing = await users.findOne({ email });
  if (existing) return res.status(400).json({ error: "User exists" });

  const hash = await bcrypt.hash(password, 10);
  const result = await users.insertOne({ email, password: hash, name: name || "", createdAt: new Date() });
  return res.json({ message: "User registered", id: result.insertedId });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await users.findOne({ email });
  if (!user) return res.status(400).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign({ id: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token });
});

// ---- FILE UPLOAD -> GridFS ----
const upload = multer({ storage: multer.memoryStorage() });

app.post("/api/upload", authMiddleware, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const stream = bucket.openUploadStream(req.file.originalname, {
      contentType: req.file.mimetype,
      metadata: { owner: req.user.id, uploadedAt: new Date() },
    });

    stream.end(req.file.buffer);

    stream.on("finish", async () => {
      try {
        const meta = {
          filename: req.file.originalname,
          fileId: stream.id,
          length: req.file.size,
          contentType: req.file.mimetype,
          owner: req.user.id,
          uploadedAt: new Date(),
        };

        await filesMeta.insertOne(meta);
        res.json({ message: "uploaded", meta });
      } catch (dbErr) {
        res.status(500).json({ error: "Failed to save metadata" });
      }
    });

    stream.on("error", () => res.status(500).json({ error: "Upload failed" }));
  } catch (err) {
    res.status(500).json({ error: "Server error during upload" });
  }
});

// ---- LINK GENERATION ----
function makeOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

app.post("/api/link/generate", authMiddleware, async (req, res) => {
  const { fileId } = req.body;
  if (!fileId) return res.status(400).json({ error: "fileId required" });

  const meta =
    (await filesMeta.findOne({ fileId: toObjectId(fileId) })) ||
    (await filesMeta.findOne({ _id: toObjectId(fileId) }));

  if (!meta) return res.status(404).json({ error: "file not found" });
  if (meta.owner !== req.user.id) return res.status(403).json({ error: "forbidden" });

  const otp = makeOtp();
  const expiresAt = new Date(Date.now() + LINK_TTL_SECONDS * 1000);

  const doc = {
    fileId: meta.fileId,
    filename: meta.filename,
    contentType: meta.contentType,
    owner: req.user.id,
    otp,
    createdAt: new Date(),
    expiresAt,
    validated: false,
  };
  const r = await links.insertOne(doc);

  try {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: req.user.email,
      subject: "Your SecurePrint OTP",
      text: `Your OTP is: ${otp}\nExpires: ${expiresAt.toLocaleString()}`,
    });
  } catch (e) {
    console.warn("📧 OTP email send failed:", e.message);
  }

  res.json({
    linkId: r.insertedId.toString(),
    expiresAt,
    url: `http://localhost:5173/shop/${r.insertedId}`,
    otp, // ⚠️ only for demo
  });
});

// ---- SEND LINK TO SHOPKEEPER ----
app.post("/api/link/send", authMiddleware, async (req, res) => {
  const { linkId, email } = req.body;
  if (!linkId || !email) {
    return res.status(400).json({ error: "linkId and email required" });
  }

  try {
    const linkDoc = await links.findOne({ _id: new ObjectId(linkId) });
    if (!linkDoc) return res.status(404).json({ error: "link not found" });

    const frontendUrl = `http://localhost:5173/shop/${linkDoc._id}`;

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "SecurePrint - Document Link",
      html: `
        <h2>SecurePrint</h2>
        <p>You have been sent a document for printing.</p>
        <p><strong>Open Link:</strong> <a href="${frontendUrl}">${frontendUrl}</a></p>
        <p><i>This link will expire at: ${linkDoc.expiresAt.toLocaleString()}</i></p>
      `,
    });

    return res.json({ success: true, message: `Link sent to ${email}` });
  } catch (err) {
    console.error("❌ Send error:", err);
    return res.status(500).json({ error: "Failed to send email", details: err.message });
  }
});

// ---- VALIDATE OTP ----
app.post("/api/link/:id/validate", async (req, res) => {
  const id = req.params.id;
  const { otp } = req.body;

  if (!otp) return res.status(400).json({ error: "otp required" });

  const linkDoc = await links.findOne({ _id: new ObjectId(id) });
  if (!linkDoc) return res.status(404).json({ error: "link not found" });
  if (linkDoc.expiresAt < new Date()) return res.status(403).json({ error: "link expired" });

  if (String(linkDoc.otp).trim() !== String(otp).trim()) {
    return res.status(403).json({ error: "invalid otp" });
  }

  await links.updateOne(
    { _id: linkDoc._id },
    { $set: { validated: true, validatedAt: new Date() } }
  );

  console.log("🔑 OTP validated for link:", id);

  return res.json({ success: true, message: "OTP validated" });
});

// ---- BLOB ROUTE (for React-PDF) ----
app.get("/api/link/:id/blob", async (req, res) => {
  const id = req.params.id;
  const linkDoc = await links.findOne({ _id: new ObjectId(id) });

  if (!linkDoc) return res.status(404).json({ error: "link not found" });
  if (!linkDoc.validated) return res.status(403).json({ error: "OTP not validated" });
  if (linkDoc.expiresAt < new Date()) return res.status(403).json({ error: "link expired" });

  try {
    const gridId = toObjectId(linkDoc.fileId);
    const downloadStream = bucket.openDownloadStream(gridId);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Cache-Control", "no-store");

    console.log("📄 Blob requested for link:", id);

    downloadStream.on("error", (err) => {
      console.error("❌ Stream error:", err);
      res.status(500).end("Error streaming file");
    });

    downloadStream.pipe(res);
  } catch (err) {
    console.error("❌ Error fetching blob:", err);
    res.status(500).json({ error: "Error streaming file" });
  }
});

// ---- START ----
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
