"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerUser } from "@/api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PASSWORD_MIN_LENGTH = 8;

export default function SignUpPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const update = (field: keyof typeof formData) =>
    (event: React.ChangeEvent<HTMLInputElement>) =>
      setFormData((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    const { name, username, email, password } = formData;

    if (!name || !username || !email || !password) {
      setError("All fields are required.");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Username may only contain letters, numbers and underscores.");
      return;
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
      return;
    }

    setIsLoading(true);
    try {
      await registerUser({ name, username, email, password });
      toast.success("Account created", { description: "Sign in to reach your dashboard." });
      router.push("/signin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm animate-rise">
      <h1 className="text-3xl font-semibold tracking-[-0.04em]">Create an account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Keep your links, QR codes and click history in one place.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[13px] font-medium">
              Name
            </Label>
            <Input
              id="name"
              name="name"
              autoComplete="name"
              required
              value={formData.name}
              onChange={update("name")}
              placeholder="Ada Lovelace"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-[13px] font-medium">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              autoComplete="username"
              required
              value={formData.username}
              onChange={update("username")}
              placeholder="ada"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-[13px] font-medium">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={update("email")}
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-[13px] font-medium">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={PASSWORD_MIN_LENGTH}
            value={formData.password}
            onChange={update("password")}
            placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
          />
          <p className="text-xs text-muted-foreground">
            At least {PASSWORD_MIN_LENGTH} characters. Letters, numbers and symbols are all fine.
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {error}
          </p>
        )}

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/signin" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
