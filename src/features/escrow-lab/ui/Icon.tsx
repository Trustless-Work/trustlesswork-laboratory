"use client";

import type { LucideIcon, LucideProps } from "lucide-react";

interface IconProps extends LucideProps {
  icon: LucideIcon | undefined;
}

/** Stable wrapper so Lucide icons resolved at runtime are not “created during render”. */
export const Icon = ({ icon: Glyph, ...props }: IconProps) => {
  if (!Glyph) return null;
  return <Glyph {...props} />;
};
