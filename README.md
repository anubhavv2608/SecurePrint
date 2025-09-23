# SecurePrint 🔒🖨️
A secure document sharing & printing system built with **MERN stack**.

## ✨ Features
- Upload files securely (stored in MongoDB GridFS).
- Auto-generate OTP-based secure link for shopkeepers.
- OTP validation before file access.
- Inline PDF preview (no download option).
- Print-only feature to protect file privacy.
- Email delivery (customer OTP + shopkeeper link).

## 🛠️ Tech Stack
- **Frontend:** React + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** MongoDB (Atlas)
- **Auth:** JWT
- **Email:** Nodemailer + Gmail App Password
- **PDF Viewer:** react-pdf / pdfjs

## ⚙️ Setup Instructions
1. **Clone repo**
   ```bash
   git clone https://github.com/<your-username>/<repo-name>.git
   cd <repo-name>
