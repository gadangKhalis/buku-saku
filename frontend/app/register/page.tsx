"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        name,
        email,
        password,
      });

      router.push("/login");
    } catch (error: any) {
      setError(error.response?.data?.message || "Registration Failed");
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>BukuSaku</h1>
      <h2>Register</h2>

      {error && <p>{error}</p>}

      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            required
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your Email"
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
            placeholder="Minimum 8 Character"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Register"}
        </button>
      </form>

      <p>or</p>

      <p>
        Already have an account? <a href="/login">Login here</a>
      </p>
    </div>
  );
}
