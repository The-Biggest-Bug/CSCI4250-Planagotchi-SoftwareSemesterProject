import type { ComponentType } from "react";

export type PageName = "home" | "tasks" | "calendar" | "settings";

export interface ButtonConfig {
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  ariaLabel: string;
}

export type Navigate = (page: PageName) => void;
