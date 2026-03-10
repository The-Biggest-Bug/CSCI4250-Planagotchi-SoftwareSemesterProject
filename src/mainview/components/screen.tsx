import type { ReactNode } from "react";

interface ScreenProps {
  children: ReactNode;
}

export default function Screen({ children }: ScreenProps) {
  return (
    <div className="relative w-[220px] h-[220px] shrink-0 rounded-2xl border border-border/60 bg-card shadow-inner flex overflow-hidden electrobun-webkit-app-region-no-drag">
      <div className="w-full h-full flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
