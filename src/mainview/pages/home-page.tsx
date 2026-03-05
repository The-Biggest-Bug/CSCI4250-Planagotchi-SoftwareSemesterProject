import { ListBulletIcon, Cog6ToothIcon, HeartIcon, HomeIcon } from "@heroicons/react/24/solid";
import Layout from "@/mainview/layout";
import type { ButtonConfig, Navigate } from "@/mainview/types";

interface HomePageProps {
  navigate: Navigate;
  eggFillColor: string;
}

export default function HomePage({ navigate, eggFillColor }: HomePageProps) {
  const buttons: ButtonConfig[] = [
    { icon: HomeIcon, onClick: () => {}, ariaLabel: "home" },
    { icon: ListBulletIcon, onClick: () => navigate("tasks"), ariaLabel: "tasks" },
    { icon: Cog6ToothIcon, onClick: () => navigate("settings"), ariaLabel: "settings" },
  ];

  return (
    <Layout buttons={buttons} eggFillColor={eggFillColor}>
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="w-3/5 flex flex-col items-center justify-center gap-3">
          <div className="flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, idx) => (
              <HeartIcon key={idx} className="w-4 h-4 text-rose-400 mb-[-12px]" />
            ))}
          </div>

          <div className="aspect-square flex items-center justify-center w-full">
            <img
              src="views://mainview/assets/evolution0.png"
              alt="pet"
              className="w-4/5 h-4/5 object-contain"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

