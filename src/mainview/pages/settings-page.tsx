import Layout from "@/mainview/layout";
import {
  ListBulletIcon,
  HomeIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/solid";
import type { ButtonConfig, Navigate } from "@/mainview/types";

interface SettingsPageProps {
  navigate: Navigate;
  eggFillColor: string;
  onEggColorChange: (color: string) => void;
}

export default function SettingsPage({
  navigate,
  eggFillColor,
  onEggColorChange,
}: SettingsPageProps) {
  const buttons: ButtonConfig[] = [
    { icon: HomeIcon, onClick: () => navigate("home"), ariaLabel: "home" },
    {
      icon: ListBulletIcon,
      onClick: () => navigate("tasks"),
      ariaLabel: "tasks",
    },
    { icon: Cog6ToothIcon, onClick: () => {}, ariaLabel: "settings" },
  ];

  return (
    <Layout buttons={buttons} eggFillColor={eggFillColor}>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="w-3/5 flex flex-col items-center justify-center gap-3">
          <h2 className="text-sm font-semibold tracking-wide uppercase text-white/80">
            Egg Color
          </h2>

          <div className="flex flex-col items-center gap-3">
            <div className="relative w-16 h-16 electrobun-webkit-app-region-no-drag">
              <div className="absolute inset-0 rounded-full border border-white/20 shadow-inner bg-black/30" />
              <div
                className="absolute inset-2 rounded-full border border-black/50"
                style={{ backgroundColor: eggFillColor }}
              />
              <input
                type="color"
                value={eggFillColor}
                onChange={(e) => onEggColorChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <div className="text-[10px] text-white/50 tracking-widest uppercase">
              {eggFillColor.toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
