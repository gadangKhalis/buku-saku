"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Email or password not valid");
      return;
    }

    router.push("/dashboard");
  };
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left Column */}
      <div className="flex items-center justify-center p-8">
        <Card className="w-full max-w-sm border-none shadow-none">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Login to BukuSaku
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your Expense Wisely
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Processing..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right Column */}
      <div className="hidden lg:flex bg-primary items-center justify-center">
        <div className="text-primary-foreground text-center px-8">
          <h2 className="text-3xl font-bold mb-2">BukuSaku</h2>
          <p className="text-primary-foreground/80">
            Record, monitor, and control your expenses every day
          </p>
        </div>
      </div>
    </div>
  );
}
