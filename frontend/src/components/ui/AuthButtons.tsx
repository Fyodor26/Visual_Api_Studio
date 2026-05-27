import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthStore } from "@/lib/auth-store";

export function AuthButtons() {
  const navigate = useNavigate();

  const user = useAuthStore((s) => s.user);

  const logout = useAuthStore((s) => s.logout);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm font-medium">
          {user.username}
        </div>

        <button
          onClick={() => {
            logout();
            window.location.href = "/";
          }}
          className="h-9 px-4 rounded-md border text-sm"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() =>
          navigate({
            to: "/login",
          })
        }
        className="h-9 px-4 rounded-md border text-sm"
      >
        Login
      </button>

      <button
        onClick={() =>
          navigate({
            to: "/signup",
          })
        }
        className="h-9 px-4 rounded-md bg-black text-white text-sm"
      >
        Sign Up
      </button>
    </div>
  );
}