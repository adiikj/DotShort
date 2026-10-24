"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
  useChangePasswordMutation,
  useProfileQuery,
  useUpdateProfileMutation,
} from "@/redux/api";
import { setSession } from "@/lib/auth";
import { apiErrorMessage } from "@/lib/errors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";

const PASSWORD_MIN_LENGTH = 8;

function ProfileCard() {
  const { data: profile, isLoading } = useProfileQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setUsername(profile.username);
    }
  }, [profile]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !username.trim()) return;

    try {
      await updateProfile({ name: name.trim(), username: username.trim() }).unwrap();
      toast.success("Profile updated");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not update your profile"));
    }
  };

  return (
    <section className="p-6">
      <h2 className="text-base font-semibold">Profile</h2>
      <p className="mt-1 text-sm text-muted-foreground">How you appear across DotShort.</p>
      <div className="mt-5">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[13px] font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username" className="text-[13px] font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  pattern="[a-zA-Z0-9_]{3,20}"
                  title="3–20 characters: letters, numbers, underscores"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[13px] font-medium">
                Email
              </Label>
              <Input id="email" value={profile?.email ?? ""} disabled aria-readonly />
              <p className="text-xs text-muted-foreground">
                Email changes aren&apos;t supported yet. It also serves as your sign-in.
              </p>
            </div>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving…" : "Save profile"}
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

function PasswordCard() {
  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      toast.error(`New password must be at least ${PASSWORD_MIN_LENGTH} characters`);
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    try {
      const tokens = await changePassword({ currentPassword, newPassword }).unwrap();
      // Keep this session signed in with the rotated token pair.
      setSession(tokens);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Password changed");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not change password"));
    }
  };

  return (
    <section className="p-6">
      <h2 className="text-base font-semibold">Password</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Changing your password signs out other sessions.
      </p>
      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="currentPassword" className="text-[13px] font-medium">
            Current password
          </Label>
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-[13px] font-medium">
              New password
            </Label>
            <Input
              id="newPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={PASSWORD_MIN_LENGTH}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-[13px] font-medium">
              Confirm new password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </div>
        </div>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Updating…" : "Change password"}
        </Button>
      </form>
    </section>
  );
}

export default function SettingsPage() {
  const { data: profile } = useProfileQuery();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHeader title="Settings" description="Manage your profile, password and account." />

      <div className="divide-y overflow-hidden rounded-lg border bg-card">
        <ProfileCard />
        <PasswordCard />
        <section className="p-6">
          <h2 className="text-base font-semibold">Account</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile?.memberSince
              ? `Member since ${new Date(profile.memberSince).toLocaleDateString(undefined, {
                  month: "long",
                  year: "numeric",
                })}.`
              : "Not available"}
          </p>
        </section>
      </div>
    </div>
  );
}
