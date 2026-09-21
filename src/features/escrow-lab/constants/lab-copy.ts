import type { LucideIcon } from "lucide-react";
import { FilePlus2Icon, WrenchIcon } from "lucide-react";
import type { EscrowType, LabTab } from "@/types";

export interface LabHeaderCopy {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function getLabHeaderCopy(
  tab: LabTab,
  type: EscrowType,
): LabHeaderCopy {
  if (tab === "deploy") {
    return {
      icon: FilePlus2Icon,
      title:
        type === "single-release"
          ? "Deploy Single-Release"
          : "Deploy Multi-Release",
      description:
        type === "single-release"
          ? "Set terms, roles, and milestones. After deploy you land in Operate to fund and release."
          : "Configure tranches and roles. After deploy you land in Operate to fund each milestone.",
    };
  }

  return {
    icon: WrenchIcon,
    title: "Operate Escrow",
    description:
      "Fund, approve, release, or dispute the escrow you just deployed. Lifecycle actions unlock by role and stage.",
  };
}
