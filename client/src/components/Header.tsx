export default function Header() {
  return (
    <header className="w-full border-b py-8">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-black font-logo tracking-tight mb-2" data-testid="text-logo">
          3F1
        </h1>
        <p className="text-sm text-muted-foreground" data-testid="text-tagline">
          Let the robots argue 🥲
        </p>
      </div>
    </header>
  );
}
