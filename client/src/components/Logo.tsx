import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  dashClassName?: string;
}

export function Logo({ className, dashClassName }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-black font-logo tracking-tighter", className)}>
      3F1
      <span className={cn("w-4 h-[4px] bg-primary rounded-full mt-1.5", dashClassName)} />
    </span>
  );
}
