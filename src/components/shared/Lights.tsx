import { cn } from "@/lib/utils";

interface LightsProps {
  className?: string;
}

export const Lights = ({ className }: LightsProps) => {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div className="absolute -top-32 left-1/4 size-72 rounded-full bg-[rgba(0,107,228,0.07)] blur-3xl" />
      <div className="absolute top-1/3 -right-20 size-64 rounded-full bg-[rgba(0,107,228,0.05)] blur-3xl" />
    </div>
  );
};
