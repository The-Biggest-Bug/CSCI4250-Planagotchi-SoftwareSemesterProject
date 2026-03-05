import type { ComponentType } from "react";

export interface ButtonConfig {
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  ariaLabel: string;
}

export type Navigate = (page: string) => void;
