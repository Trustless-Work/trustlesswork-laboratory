import { cn } from "@/lib/utils";

interface LiveStatusDotProps {
  className?: string;
  pulse?: boolean;
}

export const LiveStatusDot = ({
  className,
  pulse = true,
}: LiveStatusDotProps) => {
  return (
    <span
      className={cn(
        "relative inline-flex size-2 rounded-full bg-foreground",
        className,
      )}
    >
      {pulse ? (
        <span className="absolute inset-0 animate-ping rounded-full bg-foreground/60" />
      ) : null}
    </span>
  );
};
