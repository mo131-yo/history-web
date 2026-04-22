"use client";

import { useState } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/admin/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "Login амжилтгүй боллоо.");
      }

      window.location.reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Login алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-stone-200">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[32px] border border-amber-500/20 bg-slate-900 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
      >
        <p className="font-[family:var(--font-cinzel-decorative)] text-3xl text-amber-500">Admin</p>
        <p className="mt-3 text-sm text-stone-400">
          Polygon create, update, delete хийх хэсэг рүү орохын тулд admin нэвтрэнэ.
        </p>

        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="ADMIN_PASSWORD"
          className="mt-6 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-stone-200 outline-none"
        />

        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

        <button
          type="submit"
          disabled={loading || !password.trim()}
          className="mt-6 w-full rounded-2xl bg-amber-500 px-4 py-3 font-medium text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Нэвтэрч байна..." : "Admin руу нэвтрэх"}
        </button>
      </form>
    </main>
  );
}
