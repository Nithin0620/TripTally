"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Camera,
  Download,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import Button from "@/components/ui/Button";
import NeuInput from "@/components/ui/NeuInput";
import { authApi, ProfileResponse } from "@/lib/api/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/useToast";
import Toast from "@/components/ui/Toast";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshSession, setUser } = useAuth();
  const { toasts, showToast, removeToast } = useToast();

  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    let active = true;
    (async () => {
      const response = await authApi.getProfile();
      if (!active) return;
      if (response.error || !response.data?.user) {
        showToast(response.error || "Could not load your profile", "error");
        return;
      }
      setProfile(response.data.user);
      setName(response.data.user.name);
      setEmail(response.data.user.email);
    })();

    return () => {
      active = false;
    };
  }, [authLoading, user, router, showToast]);

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    const response = await authApi.updateProfile({ name: name.trim(), email: email.trim() });
    setSavingProfile(false);

    if (response.error || !response.data?.user) {
      showToast(response.error || "Failed to update profile", "error");
      return;
    }

    setProfile(response.data.user);
    setName(response.data.user.name);
    setEmail(response.data.user.email);
    await refreshSession();
    showToast("Profile updated", "success");

    if (response.data.user.verificationEmailSent) {
      showToast("Email changed. Check your inbox to verify the new address.", "info");
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const response = await authApi.uploadAvatar(file);
    setUploadingAvatar(false);
    event.target.value = "";

    if (response.error || !response.data?.profile_image) {
      showToast(response.error || "Failed to upload avatar", "error");
      return;
    }

    setProfile((prev) =>
      prev ? { ...prev, profile_image: response.data!.profile_image } : prev
    );
    await refreshSession();
    showToast("Profile photo updated", "success");
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast("New passwords don't match", "error");
      return;
    }

    setChangingPassword(true);
    const response = await authApi.changePassword(currentPassword, newPassword);
    setChangingPassword(false);

    if (response.error) {
      showToast(response.error, "error");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    showToast("Password changed", "success");
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch("/api/auth/export", { credentials: "include" });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Export failed");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `triptally-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      showToast("Your data export is ready", "success");
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Export failed", "error");
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Delete your account permanently? Your trips and personal data cannot be recovered."
    );
    if (!confirmed) return;

    setDeleting(true);
    const response = await authApi.deleteAccount(deletePassword || undefined);
    setDeleting(false);

    if (response.error) {
      showToast(response.error, "error");
      return;
    }

    setUser(null);
    showToast("Your account has been deleted", "success");
    router.replace("/");
  };

  if (authLoading || !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">
        Loading account settings…
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen px-4 py-28">
        <div className="mx-auto max-w-3xl space-y-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Account settings</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your profile, security, and personal data.
            </p>
          </div>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-900/5"
          >
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-xl font-bold text-blue-700">
                {profile.profile_image ? (
                  <img
                    src={profile.profile_image}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profile.name.slice(0, 2).toUpperCase()
                )}
                <label className="absolute inset-0 flex cursor-pointer items-center justify-center bg-slate-900/0 text-white opacity-0 transition-all hover:bg-slate-900/50 hover:opacity-100">
                  <Camera className="h-5 w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploadingAvatar}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Profile photo</h2>
                <p className="text-xs text-slate-500">
                  {uploadingAvatar ? "Uploading…" : "Click the photo to upload a new one (max 5 MB)."}
                </p>
                {profile.email_verified === false && (
                  <p className="mt-2 text-xs font-semibold text-amber-600">
                    Email not verified.{" "}
                    <a
                      href={`/verify-email?email=${encodeURIComponent(profile.email)}`}
                      className="underline"
                    >
                      Resend the link
                    </a>
                    .
                  </p>
                )}
              </div>
            </div>

            <form onSubmit={handleProfileSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
              <NeuInput
                label="Full Name"
                icon={<User className="h-4 w-4" />}
                value={name}
                onChange={(event) => setName(event.target.value)}
                disabled={savingProfile}
                required
              />
              <NeuInput
                label="Email Address"
                icon={<Mail className="h-4 w-4" />}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={savingProfile}
                required
                hint="Changing your email requires re-verification."
              />
              <div className="sm:col-span-2">
                <Button type="submit" variant="primary" disabled={savingProfile}>
                  {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                  <span>Save profile</span>
                </Button>
              </div>
            </form>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-900/5"
          >
            <h2 className="text-lg font-bold text-slate-900">Change password</h2>
            <p className="mt-1 text-xs text-slate-500">
              Google accounts without a saved password can set one from “Forgot password?” on the sign-in page.
            </p>
            <form onSubmit={handlePasswordSubmit} className="mt-5 grid gap-4 sm:grid-cols-3">
              <NeuInput
                label="Current Password"
                icon={<KeyRound className="h-4 w-4" />}
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                disabled={changingPassword}
                required
              />
              <NeuInput
                label="New Password"
                icon={<KeyRound className="h-4 w-4" />}
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={8}
                disabled={changingPassword}
                required
              />
              <NeuInput
                label="Confirm Password"
                icon={<KeyRound className="h-4 w-4" />}
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                disabled={changingPassword}
                required
              />
              <div className="sm:col-span-3">
                <Button type="submit" variant="secondary" disabled={changingPassword}>
                  {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  <span>Update password</span>
                </Button>
              </div>
            </form>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-lg shadow-slate-900/5"
          >
            <h2 className="text-lg font-bold text-slate-900">Your data</h2>
            <p className="mt-1 text-xs text-slate-500">
              Download a copy of your trips, itinerary, expenses, and messages.
            </p>
            <div className="mt-4">
              <Button variant="secondary" onClick={handleExport} disabled={exporting}>
                {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                <span>Download my data</span>
              </Button>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-3xl border border-rose-200 bg-rose-50/60 p-6"
          >
            <h2 className="text-lg font-bold text-rose-900">Delete account</h2>
            <p className="mt-1 text-xs text-rose-800">
              This permanently removes your account and trips you created. This cannot be undone.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <NeuInput
                label="Current password (if applicable)"
                icon={<KeyRound className="h-4 w-4" />}
                type="password"
                value={deletePassword}
                onChange={(event) => setDeletePassword(event.target.value)}
                disabled={deleting}
                placeholder="Only for email sign-in"
              />
              <div className="flex items-end">
                <Button variant="outline" onClick={handleDelete} disabled={deleting} className="!border-rose-300 !text-rose-700 hover:!bg-rose-100">
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  <span>Delete my account</span>
                </Button>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
      <Toast toasts={toasts} onRemove={removeToast} />
    </>
  );
}
