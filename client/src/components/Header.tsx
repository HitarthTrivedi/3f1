import { Logo } from "./Logo";

export default function Header() {
  return (
    <header className="w-full border-b py-8">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h1 className="text-5xl font-black tracking-tight mb-2" data-testid="text-logo">
          <Logo className="text-5xl" dashClassName="w-6 h-1.5 mt-3" />
        </h1>
        <p className="text-sm text-muted-foreground" data-testid="text-tagline">
          Let the robots argue 🥲
        </p>
      </div>
    </header>
  );
}
