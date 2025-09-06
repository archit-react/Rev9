import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";

interface User {
  _id?: string;
  username: string;
  email: string;
  role: string;
  status: string;
  avatar?: string;
}

interface UserModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (user: User) => void;
  user: User | null;
}

export default function UserModal({
  show,
  onClose,
  onSave,
  user,
}: UserModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setRole(user.role || "");
      setStatus(user.status || "");
    } else {
      setUsername("");
      setEmail("");
      setRole("");
      setStatus("");
    }
  }, [user]);

  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      _id: user?._id,
      username,
      email,
      role,
      status,
      avatar: user?.avatar || `https://i.pravatar.cc/150?u=${email}`,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        className="
          relative w-full max-w-md rounded-2xl p-6
          bg-surface border border-elev shadow-fresh-lg
          text-foreground
        "
      >
        <button
          onClick={onClose}
          className="
            absolute top-3 right-3 inline-flex h-8 w-8 items-center justify-center rounded-full
            text-muted-foreground hover:text-foreground
            hover:bg-muted/30 transition
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/30
          "
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          {user ? "Edit User" : "Add New User"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="
              w-full px-4 py-2 rounded-xl
              bg-surface border border-elev
              focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/30
            "
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full px-4 py-2 rounded-xl
              bg-surface border border-elev
              focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/30
            "
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="
              w-full px-4 py-2 rounded-xl
              bg-surface border border-elev
              focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/30
            "
            required
          >
            <option value="">Select Role</option>
            <option value="Admin">Admin</option>
            <option value="Member">Member</option>
            <option value="Moderator">Moderator</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="
              w-full px-4 py-2 rounded-xl
              bg-surface border border-elev
              focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/30
            "
            required
          >
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          <button
            type="submit"
            className="
              w-full py-2 rounded-xl
              bg-primary text-white hover:bg-primary/90
              border border-transparent shadow-fresh
              transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/30
            "
          >
            Save User
          </button>
        </form>
      </motion.div>
    </div>
  );
}
