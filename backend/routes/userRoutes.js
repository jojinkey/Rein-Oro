import { Router } from "express";
import * as user from "../controller/userController.js";
import { protect, syncUserProfile, getProfile } from "../controller/authController.js";

const router = Router();

router.get("/api/users", user.getUsers);
router.get("/api/users/addresses", user.getUserAddresses);
router.put("/api/users/addresses", user.updateUserAddresses);
router.put("/api/users/:id/role", user.updateUserRole);
router.delete("/api/users/:id", user.deleteUser);
router.get("/api/users/wishlist", user.getUserWishlist);
router.post("/api/users/wishlist/toggle", user.toggleUserWishlist);

// Firebase integration routes
router.get("/api/auth/profile", protect, getProfile);
router.post("/api/auth/profile/sync", protect, syncUserProfile);

export default router;
