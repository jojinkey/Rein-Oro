import {
 queryFirestoreCollection,
 mirrorToFirestore,
 deleteFromFirestore,
 getFirestoreDocument,
} from "../util/firestore.js";

export async function getUsers(req, res) {
 try {
  const list = await queryFirestoreCollection("users");
  res.json(
   list.map((u) => ({
    id: u.id || u.email,
    email: u.email,
    role: u.role,
    member_since: u.member_since,
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
