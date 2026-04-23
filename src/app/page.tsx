export default function HomePage() {
  return (
    <main style={{ padding: '24px' }}>
      <h1>Mongol Atlas</h1>
      <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
        <a href="/sign-in">Sign in</a>
        <a href="/sign-up">Sign up</a>
      </div>
    </main>
  );
}