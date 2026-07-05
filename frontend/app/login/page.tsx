"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next-navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  const handleCredentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Email or password not valid");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };
  return (
    <div>
      <h1>BukuSaku</h1>
      <h2>Login</h2>

      {/* Error Message */}
      {error && <p>{error}</p>}

      {/* Form Credentials */}
      <form onSubmit={handleCredentLogin}>
        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@mail.com"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "loading..." : "Login"}
        </button>
      </form>

      {/* Divider */}
      <p>or</p>

      {/* OAuth button */}
      <button onClick={() => signIn(google, { callbackUrl: "/dashboard" })}>
        Login with Google
      </button>

      {/* Link to register */}
      <p>
        Hav no account yet? <a href="/register">Resgister here</a>
      </p>
    </div>
  );
}
