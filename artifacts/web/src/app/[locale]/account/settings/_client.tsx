"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@workspace/replit-auth-web";
import { Button } from "@/components/ui/button";
import { User, KeyRound, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export function AccountSettingsClient() {
  const { t } = useI18n();
  const { user, isAuthenticated, isLoading: isAuthLoading, login, refreshUser } = useAuth();

  const inputClass =
    "w-full rounded-xl border border-border/60 bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition";

  // ─── Profile ──────────────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [nameStatus, setNameStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    if (user) {
      const full = [user.firstName, user.lastName].filter(Boolean).join(" ");
      setName(full);
    }
  }, [user]);

  const handleNameSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setNameStatus("loading");
    setNameError("");
    try {
      const res = await fetch("/api/auth/update-user", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        setNameStatus("success");
        await refreshUser();
        setTimeout(() => setNameStatus("idle"), 3000);
      } else {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        setNameError(data.message ?? t("common.error"));
        setNameStatus("error");
      }
    } catch {
      setNameError(t("common.error"));
      setNameStatus("error");
    }
  };

  // ─── Security ─────────────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [pwError, setPwError] = useState("");

  const handlePwSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwError(t("settings.security.mismatch"));
      setPwStatus("error");
      return;
    }
    if (newPassword.length < 8) {
      setPwError(t("settings.security.min_length"));
      setPwStatus("error");
      return;
    }
    setPwStatus("loading");
    setPwError("");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          revokeOtherSessions: false,
        }),
      });
      if (res.ok) {
        setPwStatus("success");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPwStatus("idle"), 3000);
      } else {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        setPwError(data.message ?? t("common.error"));
        setPwStatus("error");
      }
    } catch {
      setPwError(t("common.error"));
      setPwStatus("error");
    }
  };

  // ─── Loading / unauth ─────────────────────────────────────────────────────────
  if (isAuthLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center">
        <Button onClick={login} size="lg" className="rounded-full">
          {t("auth.login")}
        </Button>
      </div>
    );
  }

  return (
    <>
      <section className="border-b border-border/60 bg-background">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            {t("settings.title")}
          </h1>
          {user?.email && (
            <p className="text-muted-foreground mt-1 text-sm">{user.email}</p>
          )}
        </div>
      </section>

      <div className="container mx-auto px-4 py-10 max-w-2xl space-y-8">
        {/* Profile */}
        <div className="bg-card rounded-2xl border border-border/60 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              {t("settings.profile.title")}
            </h2>
          </div>

          <form onSubmit={handleNameSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">
                {t("settings.profile.name")}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameStatus !== "idle") setNameStatus("idle");
                }}
                placeholder={t("settings.profile.name_placeholder")}
                className={inputClass}
              />
            </div>

            {nameStatus === "success" && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {t("settings.profile.success")}
              </div>
            )}
            {nameStatus === "error" && nameError && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {nameError}
              </div>
            )}

            <Button
              type="submit"
              disabled={nameStatus === "loading" || !name.trim()}
              className="rounded-full"
            >
              {nameStatus === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : null}
              {t("settings.profile.save")}
            </Button>
          </form>
        </div>

        {/* Security */}
        <div className="bg-card rounded-2xl border border-border/60 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <KeyRound className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              {t("settings.security.title")}
            </h2>
          </div>

          <form onSubmit={handlePwSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">
                {t("settings.security.current_password")}
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (pwStatus !== "idle") setPwStatus("idle");
                }}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">
                {t("settings.security.new_password")}
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (pwStatus !== "idle") setPwStatus("idle");
                }}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">
                {t("settings.security.confirm_password")}
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (pwStatus !== "idle") setPwStatus("idle");
                }}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            {pwStatus === "success" && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {t("settings.security.success")}
              </div>
            )}
            {pwStatus === "error" && pwError && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {pwError}
              </div>
            )}

            <Button
              type="submit"
              disabled={pwStatus === "loading"}
              className="rounded-full"
            >
              {pwStatus === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin me-2" />
              ) : null}
              {t("settings.security.save")}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
