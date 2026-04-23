import { Show, SignInButton, UserButton } from '@clerk/nextjs';

export default function HomePage() {
  return (
    <main className="p-6">
      <h1>mongol-atlas</h1>

      <Show when="signed-out">
        <SignInButton />
      </Show>

      <Show when="signed-in">
        <UserButton />
      </Show>
    </main>
  );
}
