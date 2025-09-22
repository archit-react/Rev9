export type RoleKey = "admin" | "editor" | "user" | "other";

export interface User {
  _id?: string;
  username: string;
  email: string;
  role: "admin" | "editor" | "user" | string;
  status: "Active" | "Inactive" | "Pending" | string;
  avatar?: string;
  activityPct?: number;
}

export type ApiError = { error?: string };
