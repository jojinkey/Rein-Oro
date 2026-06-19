import { Router } from "express";
import * as user from "../controller/userController.js";

const router = Router();

router.get("/api/users", user.getUsers);
router.get("/api/users/addresses", user.getUserAddresses);
router.put("/api/users/addresses", user.updateUserAddresses);
router.put("/api/users/:id/role", user.updateUserRole);
router.delete("/api/users/:id", user.deleteUser);
router.get("/api/users/wishlist", user.getUserWishlist);
router.post("/api/users/wishlist/toggle", user.toggleUserWishlist);

export default router;
