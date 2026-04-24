"use client";

import { Crown, LogIn, LogOut, User, UserPlus } from "lucide-react";
import { sidebarTheme as T } from "./sidebarTheme";

export function SidebarUserPanel({
  adminMode,
  user,
  onSignIn,
  onSignUp,
  onSignOut,
}: {
  adminMode: boolean;
  user:
    | {
        fullName?: string | null;
        imageUrl?: string;
        primaryEmailAddress?: { emailAddress?: string } | null;
      }
    | null
    | undefined;
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="shrink-0 px-4 py-4" style={{ borderTop: `1px solid ${T.border}` }}>
      {user ? (
        <div className="flex items-center gap-3 rounded-lg px-3 py-2.5" style={{ background: "rgba(15,23,42,0.6)", border: `1px solid ${T.border}` }}>
          {user.imageUrl ? (
            <img src={user.imageUrl} alt="" className="h-8 w-8 shrink-0 rounded-lg border object-cover" style={{ borderColor: T.border }} />
          ) : (
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border" style={{ borderColor: T.border, background: T.amberGlow }}>
              <User className="size-4" style={{ color: T.amberDim }} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs" style={{ color: T.text }}>
              {user.fullName ?? user.primaryEmailAddress?.emailAddress ?? "Хэрэглэгч"}
            </p>
            <div className="mt-0.5 flex items-center gap-1">
              <Crown className="size-2.5" style={{ color: T.amber }} />
              <span className="text-[8px] uppercase tracking-widest" style={{ color: T.amber }}>
                {adminMode ? "Хаан · Засах эрхтэй" : "Хэрэглэгч"}
              </span>
            </div>
          </div>
          <button type="button" onClick={onSignOut} className="rounded-md p-1.5 transition-colors hover:opacity-70" style={{ border: `1px solid ${T.border}`, color: T.textMuted }} title="Гарах">
            <LogOut className="size-3" />
          </button>
        </div>
      ) : (
        <div className="grid gap-2">
          <button type="button" onClick={onSignIn} className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs transition-all hover:opacity-80" style={{ border: `1px solid ${T.border}`, background: "rgba(15,23,42,0.6)", color: T.text, fontFamily: "Georgia, serif" }}>
            <LogIn className="size-3.5" />
            Нэвтрэх
          </button>
          <button type="button" onClick={onSignUp} className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs transition-all hover:opacity-80" style={{ border: `1px solid ${T.amber}44`, background: "linear-gradient(135deg, rgba(245,158,11,0.14), rgba(245,158,11,0.04))", color: T.amber, fontFamily: "Georgia, serif" }}>
            <UserPlus className="size-3.5" />
            Бүртгүүлэх
          </button>
        </div>
      )}
    </div>
  );
}
