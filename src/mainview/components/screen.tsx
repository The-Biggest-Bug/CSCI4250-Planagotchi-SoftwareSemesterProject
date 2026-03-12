import type { ReactNode } from "react";

interface ScreenProps {
  children: ReactNode;
  backgroundImageUrl?: string;
}

export default function Screen({ children, backgroundImageUrl }: ScreenProps) {
  return (
    <div className="relative w-[220px] h-[220px] shrink-0 rounded-2xl border border-border/60 bg-card shadow-inner flex overflow-hidden electrobun-webkit-app-region-no-drag">
      {backgroundImageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url("${backgroundImageUrl}")` }}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/20 pointer-events-none" />
      <div className="relative w-full h-full flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
