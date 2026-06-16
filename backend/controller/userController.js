import {
 queryFirestoreCollection,
 mirrorToFirestore,
 deleteFromFirestore,
 getFirestoreDocument,
} from "../util/firestore.js";

function formatMemberSince(u) {
 if (u.member_since) {
  return u.member_since;
 }
 const dateVal = u.createdAt;
 if (!dateVal) {
  return "N/A";
 }
 let dateObj = null;
 if (typeof dateVal.toDate === "function") {
  dateObj = dateVal.toDate();
 } else if (typeof dateVal === "object" && (dateVal._seconds || dateVal.seconds)) {
  const secs = dateVal._seconds || dateVal.seconds;
  dateObj = new Date(secs * 1000);
 } else {
  dateObj = new Date(dateVal);
 }
 if (!dateObj || isNaN(dateObj.getTime())) {
  return "N/A";
 }
 const pad = (n) => String(n).padStart(2, "0");
 return `${dateObj.getFullYear()}-${pad(dateObj.getMonth() + 1)}-${pad(dateObj.getDate())} ${pad(dateObj.getHours())}:${pad(dateObj.getMinutes())}:${pad(dateObj.getSeconds())}`;
}

export async function getUsers(req, res) {
 try {
  const list = await queryFirestoreCollection("users");
  res.json(
   list.map((u) => ({
    id: u.id || u.email,
    email: u.email,
    role: u.role,
    member_since: formatMemberSince(u),
   })),
  );
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function updateUserRole(req, res) {
 const { id } = req.params;
 const { role } = req.body;
 try {
  const existing = await getFirestoreDocument("users", id);
  await mirrorToFirestore("users", id, { ...(existing || {}), role });
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}

export async function deleteUser(req, res) {
 const { id } = req.params;
 try {
  await deleteFromFirestore("users", id);
  res.json({ success: true });
 } catch (err) {
  res.status(400).json({ error: err.message });
 }
}
