// backend/models.js
import { ObjectId } from "mongodb";

export function UsersColl(db) { return db.collection("users"); }
export function FilesColl(db) { return db.collection("files_meta"); } // metadata
export function LinksColl(db) { return db.collection("links"); }

/* helper to convert string id -> ObjectId */
export function toObjectId(id) {
  if (!id) return null;
  return typeof id === "string" && id.length === 24 ? new ObjectId(id) : id;
}
