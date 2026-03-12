import {
  CalendarDaysIcon,
  ListBulletIcon,
  Cog6ToothIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import Layout from "@/mainview/layout";
import type { ButtonConfig, Navigate } from "@/mainview/types";

interface HomePageProps {
  navigate: Navigate;
  eggFillColor: string;
}

export default function HomePage({ navigate, eggFillColor }: HomePageProps) {
  const buttons: ButtonConfig[] = [
    {
      icon: CalendarDaysIcon,
      onClick: () => navigate("calendar"),
      ariaLabel: "calendar",
    },
    {
      icon: ListBulletIcon,
      onClick: () => navigate("tasks"),
      ariaLabel: "tasks",
    },
    {
      icon: Cog6ToothIcon,
      onClick: () => navigate("settings"),
      ariaLabel: "settings",
    },
  ];

  return (
    <Layout buttons={buttons} eggFillColor={eggFillColor}>
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center blur-[1px] scale-105"
          style={{
            backgroundImage:
              'url("views://mainview/assets/egg-background.webp")',
          }}
        />

        <div className="relative w-3/5 flex flex-col items-center justify-center gap-3">
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 border border-white/20">
              {Array.from({ length: 5 }).map((_, idx) => (
                <HeartIcon
                  key={idx}
                  className="w-4 h-4 text-rose-400"
                />
              ))}
            </div>
          </div>

          <div className="aspect-square flex flex-col items-center justify-center w-full gap-2">
            <img
              src="views://mainview/assets/evolution0.png"
              alt="pet"
              className="w-4/5 h-4/5 object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.9)]"
              draggable={false}
            />

            <div className="w-4/5 h-2 rounded-full bg-black/65 overflow-hidden border border-white/20 mt-2">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500"
                style={{ width: "70%" }}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
