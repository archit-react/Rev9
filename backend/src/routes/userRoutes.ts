// src/routes/userRoutes.ts
import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { JwtPayload } from "jsonwebtoken";
import { verifyToken, AuthRequest } from "../middleware/auth"; // ✅ fixed path
import { User } from "../models/User";

const router = express.Router();

/** Shape we put in the JWT (id/email/role) */
type Decoded = JwtPayload & {
  id?: string;
  email?: string;
  role?: string;
};

/** Narrow and safely read auth user id from req.user without using `any` */
const getAuthUserId = (req: AuthRequest): string | null => {
  const u = req.user as Decoded | undefined;
  return typeof u?.id === "string" ? u.id : null;
};

/** Error type for duplicate-key detection from Mongo/Mongoose */
type MongoDuplicateError = Error & {
  code?: number;
  keyValue?: Record<string, unknown>;
};

/** Map any UI role to schema-accepted values ("user" | "admin") */
const mapRole = (r?: string): "user" | "admin" => {
  if (!r) return "user";
  return r.toLowerCase() === "admin" ? "admin" : "user";
};

// GET /api/users - list all users (protected)
router.get("/", verifyToken, async (_req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password"); // exclude password
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// GET /api/users/profile - current user's profile (protected)
router.get("/profile", verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const authUserId = getAuthUserId(req);
    if (!authUserId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(authUserId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// POST /api/users - create a user (protected)
router.post("/", verifyToken, async (req: Request, res: Response) => {
  try {
    const {
      username,
      email,
      role,
      status = "Active",
      avatar = "",
      password,
    } = (req.body ?? {}) as {
      username?: string;
      email?: string;
      role?: string;
      status?: string;
      avatar?: string;
      password?: string;
    };

    if (!username || !email) {
      return res.status(400).json({ error: "username and email are required" });
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res
        .status(400)
        .json({ error: "Email or username already in use" });
    }

    const normalizedRole = mapRole(role);
    const temp = password ?? Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(temp, 10);

    const created = await User.create({
      username,
      email,
      password: hashedPassword,
      role: normalizedRole,
      status, // ignored by schema (ok)
      avatar,
    });

    // Remove password safely (no unused var)
    const createdObj: Record<string, unknown> =
      created.toObject() as unknown as Record<string, unknown>;
    delete (createdObj as { password?: unknown }).password;

    res.status(201).json(createdObj);
  } catch (err) {
    const error = err as MongoDuplicateError;
    if (error?.code === 11000) {
      return res
        .status(400)
        .json({ error: "Email or username already in use" });
    }
    console.error("Create user error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT /api/users/:id - update a user (protected)
router.put("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const { username, email, role, status, avatar } = (req.body ?? {}) as {
      username?: string;
      email?: string;
      role?: string;
      status?: string;
      avatar?: string;
    };

    const update: Record<string, unknown> = {};
    if (typeof username === "string") update.username = username;
    if (typeof email === "string") update.email = email;
    if (typeof role === "string") update.role = mapRole(role);
    if (typeof status === "string") update.status = status; // ignored by schema (ok)
    if (typeof avatar === "string") update.avatar = avatar;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: update },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    const error = err as MongoDuplicateError;
    if (error?.code === 11000) {
      return res
        .status(400)
        .json({ error: "Email or username already in use" });
    }
    console.error("Update error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// DELETE /api/users/:id - delete a user (protected)
router.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id).select(
      "-password"
    );

    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
