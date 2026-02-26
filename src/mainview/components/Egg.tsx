import { ReactNode } from "react";
import Screen from "@/mainview/components/Screen";

interface EggProps {
  children: ReactNode;
}

export default function Egg({ children }: EggProps) {
  return (
    <div className="relative w-full h-full flex flex-col electrobun-webkit-app-region-drag">
      <img
        src="views://mainview/assets/egg.svg"
        alt="egg"
        className="absolute inset-0 w-full h-full pointer-events-none object-contain"
      />

      <h1 className="absolute bottom-12 left-0 right-0 text-center font-fredoka font-bold text-2xl text-card select-none pointer-events-none z-20">
        planagotchi
      </h1>

      <div className="relative z-10 flex items-center justify-center h-full px-10 overflow-hidden">
        <Screen>{children}</Screen>
      </div>
    </div>
  );
}
