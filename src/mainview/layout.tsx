import type { ReactNode } from "react";
import type { ButtonConfig } from "@/mainview/types";
import Screen from "@/mainview/components/screen";

const EGG_RINGS =
  "m149 349.56c-80.19 0-145-66.5-145-148.78 0-82.27 64.82-148.78 145-148.78 80.19 0 145 66.51 145 148.78 0 82.28-64.81 148.78-145 148.78zm0-49c-71.89 0-130-66.5-130-148.78 0-82.27 58.11-148.78 130-148.78 71.89 0 130 66.51 130 148.78 0 82.28-58.11 148.78-130 148.78zm-0.5 53.14c-79.13 0-143.09-77.52-143.09-173.42 0-95.9 63.96-173.42 143.09-173.42 79.13 0 143.09 77.52 143.09 173.42 0 95.9-63.96 173.42-143.09 173.42zm0.72 1.69c-80.01 0-144.68-75.96-144.68-169.94 0-93.97 64.67-169.94 144.68-169.94 80.02 0 144.69 75.97 144.69 169.94 0 93.98-64.67 169.94-144.69 169.94zm-0.53-4c-80.02 0-144.69-65.79-144.69-147.19 0-81.4 64.67-147.2 144.69-147.2 80.01 0 144.68 65.8 144.68 147.2 0 81.4-64.67 147.19-144.68 147.19zm0.06-8.7c-80.98 0-146.44-70.64-146.44-158.03 0-87.39 65.46-158.03 146.44-158.03 80.98 0 146.44 70.64 146.44 158.03 0 87.39-65.46 158.03-146.44 158.03zm0-20.97c-76.45 0-138.24-70.65-138.24-158.06 0-87.41 61.79-158.06 138.24-158.06 76.46 0 138.25 70.65 138.25 158.06 0 87.41-61.79 158.06-138.25 158.06zm0-4.47c-73.46 0-132.85-70.44-132.85-157.59 0-87.14 59.39-157.58 132.85-157.58 73.47 0 132.86 70.44 132.86 157.58 0 87.15-59.39 157.59-132.86 157.59z";

interface LayoutProps {
  children: ReactNode;
  buttons: ButtonConfig[];
  eggFillColor?: string;
}

export default function Layout({
  children,
  buttons,
  eggFillColor = "#fff000",
}: LayoutProps) {
  return (
    <div className="relative w-full h-full flex flex-col electrobun-webkit-app-region-drag">
      <svg
        viewBox="0 0 298 359"
        className="absolute inset-0 w-full h-full pointer-events-none object-contain"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="egg-clip" clipPathUnits="userSpaceOnUse">
            <path d={EGG_RINGS} />
          </clipPath>
        </defs>
        <image
          href="views://mainview/assets/egg-texture-placeholder.png"
          x="0"
          y="0"
          width="298"
          height="359"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#egg-clip)"
          className="grayscale"
        />
        <path fill={eggFillColor} opacity="0.45" d={EGG_RINGS} />
      </svg>

      <div className="relative z-10 flex flex-col items-center justify-center h-full px-10 overflow-hidden">
        <div className="mb-2">
          <Screen>{children}</Screen>
        </div>
        <div className="flex items-end justify-center gap-3 mt-1">
          {buttons.map((btn, i) => {
            const isOuter = i !== 1;
            return (
              <button
                key={btn.ariaLabel}
                type="button"
                aria-label={btn.ariaLabel}
                className={`w-16 h-9 rounded-[50%] bg-[#2a2e3a] shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] border border-black/30 cursor-pointer hover:brightness-125 transition-all electrobun-webkit-app-region-no-drag flex items-center justify-center ${isOuter ? "translate-y-1" : "-translate-y-0.5"}`}
                onClick={btn.onClick}
              >
                <btn.icon className="w-4 h-4 text-white/70" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
