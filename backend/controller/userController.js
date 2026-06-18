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

export async function getUserAddresses(req, res) {
 const { email } = req.query;
 if (!email) {
  return res.status(400).json({ error: "Email parameter is required" });
 }
 try {
  const users = await queryFirestoreCollection("users", {
   where: [["email", "==", email.trim().toLowerCase()]],
  });
  if (!users || users.length === 0) {
   return res.status(404).json({ error: "User profile not found" });
  }
  const addresses = users[0].addresses || [];
  res.json(addresses);
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}

export async function updateUserAddresses(req, res) {
 const { email, addresses } = req.body;
 if (!email) {
  return res.status(400).json({ error: "Email is required" });
 }
 if (!Array.isArray(addresses)) {
  return res.status(400).json({ error: "Addresses must be an array" });
 }
 try {
  const users = await queryFirestoreCollection("users", {
   where: [["email", "==", email.trim().toLowerCase()]],
  });
  if (!users || users.length === 0) {
   return res.status(404).json({ error: "User profile not found" });
  }
  const userDoc = users[0];
  const docId = userDoc.id;
  await mirrorToFirestore("users", docId, {
   ...userDoc,
   addresses,
  });
  res.json({ success: true, addresses });
 } catch (err) {
  res.status(500).json({ error: err.message });
 }
}
