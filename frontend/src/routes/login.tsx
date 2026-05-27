import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    setLoading(true);

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Login failed");
      return;
    }

    localStorage.setItem(
      "auth-storage",
      JSON.stringify({
        state: {
          user: data.user,
          token: data.token,
          loading: false,
        },
        version: 0,
      })
    );

    alert("Login successful");

    window.location.href = "/";
  } catch (err) {
    alert("Server error");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md rounded-xl border border-border bg-card p-6 space-y-4"
      >
        <div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Login to your account
          </p>
        </div>

        <input
          type="email"
          placeholder="Email"
          className="w-full h-11 rounded-md border border-border bg-background px-3"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full h-11 rounded-md border border-border bg-background px-3"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-md bg-primary text-primary-foreground font-medium"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="text-sm text-center text-muted-foreground">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-primary">
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
}