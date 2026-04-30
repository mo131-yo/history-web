'use client';

import { LogIn, LogOut, ShieldCheck, User, UserPlus } from 'lucide-react';
import { sidebarTheme as T } from './sidebarTheme';

export type UserSyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

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
        username?: string | null;
        imageUrl?: string;
        primaryEmailAddress?: { emailAddress?: string } | null;
      }
    | null
    | undefined;
  syncStatus: UserSyncStatus;
  onSignIn: () => void;
  onSignUp: () => void;
  onSignOut: () => void;
}) {
  const name = user?.fullName ?? user?.username ?? 'Хэрэглэгч';
  const email = user?.primaryEmailAddress?.emailAddress ?? 'Clerk account';
  const initials = getInitials(name, email);

  return (
    <div
      className="px-3 pt-2 pb-3 shrink-0"
      style={{ background: T.bg, borderTop: `1px solid ${T.border}` }}
    >
      {user ? (
        <div
          className="overflow-hidden rounded-lg"
          style={{
            boxShadow:
              '0 14px 30px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <div className="flex items-center gap-3 px-3 py-3 border-[1px] border-gray-200 rounded-lg">
            <div className="relative shrink-0">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt=""
                  className="object-cover border rounded-lg h-11 w-11"
                  style={{ borderColor: `${T.amber}55` }}
                />
              ) : (
                <div
                  className="flex items-center justify-center text-sm font-bold border rounded-lg h-11 w-11"
                  style={{
                    borderColor: `${T.amber}55`,
                    background: T.amberGlow,
                    color: T.amber,
                  }}
                >
                  {initials || <User className="size-5" />}
                </div>
              )}
              <span
                className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border"
                style={{
                  background: adminMode ? T.amber : '#7ddc8a',
                  borderColor: 'rgba(8,13,24,0.95)',
                }}
              >
                <ShieldCheck
                  className="size-2.5"
                  style={{ color: adminMode ? '#111827' : '#052e16' }}
                />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p
                  className="min-w-0 text-sm font-semibold leading-tight truncate"
                  style={{ color: T.text }}
                >
                  {name}
                </p>
              </div>
              <p
                className="mt-0.5 truncate text-[10px]"
                style={{ color: T.textMuted }}
              >
                {email}
              </p>
              <div className="mt-2 flex items-center gap-1.5">
                <span
                  className="rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest"
                  style={{
                    background: adminMode
                      ? `${T.amber}1f`
                      : 'rgba(125,220,138,0.12)',
                    border: `1px solid ${adminMode ? `${T.amber}44` : 'rgba(125,220,138,0.28)'}`,
                    color: adminMode ? T.amber : '#7ddc8a',
                  }}
                >
                  {adminMode ? 'Admin' : 'User'}
                </span>
                <span
                  className="truncate text-[9px]"
                  style={{ color: T.textSub }}
                >
                  {adminMode ? 'Засах эрхтэй' : 'Атлас хэрэглэгч'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="flex items-center justify-center w-8 h-8 transition-colors rounded-md shrink-0 hover:opacity-70"
              style={{
                border: `1px solid ${T.border}`,
                color: T.textMuted,
                background: 'rgba(8,13,24,0.72)',
              }}
              title="Гарах"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-2">
          <button
            type="button"
            onClick={onSignIn}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs transition-all hover:opacity-80"
            style={{
              border: `1px solid ${T.border}`,
              background: 'rgba(254, 254, 254, 0.72)',
              color: T.text,
              fontFamily: 'var(--font-inter), Arial, sans-serif',
            }}
          >
            <LogIn className="size-3.5" />
            Нэвтрэх
          </button>
          <button
            type="button"
            onClick={onSignUp}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs transition-all hover:opacity-80"
            style={{
              border: `1px solid ${T.amber}44`,
              background:
                '#0c60a9',
              color: T.textpin,
              fontFamily: 'var(--font-inter), Arial, sans-serif',
            }}
          >
            <UserPlus className="size-3.5" />
            Бүртгүүлэх
          </button>
        </div>
      )}
    </div>
  );
}

function getInitials(name: string, email: string) {
  const source = name !== 'Хэрэглэгч' ? name : email;
  return source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}
