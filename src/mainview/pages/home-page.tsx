import {
  CalendarDaysIcon,
  ListBulletIcon,
  Cog6ToothIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import Layout from "@/mainview/layout";
import type { ButtonConfig, Navigate } from "@/mainview/types";
import type { PetDTO } from "@/shared/rpc";

interface HomePageProps {
  navigate: Navigate;
  pet: PetDTO;
  eggFillColor: string;
  eggBackgroundImageUrl: string;
  dinoBackgroundImageUrl: string;
}

const EVOLUTION_LABELS = ["SPROUT", "HATCHLING", "DINO"];

export default function HomePage({
  navigate,
  pet,
  eggFillColor,
  eggBackgroundImageUrl,
  dinoBackgroundImageUrl,
}: HomePageProps) {
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

  const progressPercent =
    (pet.xpIntoCurrentEvolution / pet.xpForNextEvolution) * 100;
  const evolutionLabel =
    EVOLUTION_LABELS[pet.evolutionImageIndex] ??
    `DINO ${pet.evolutionLevel + 1}`;

  return (
    <Layout
      buttons={buttons}
      eggFillColor={eggFillColor}
      eggBackgroundImageUrl={eggBackgroundImageUrl}
      dinoBackgroundImageUrl={dinoBackgroundImageUrl}
    >
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
        <div className="relative flex h-full w-full items-center justify-center px-3 py-2">
          <div className="flex w-full max-w-[220px] flex-col items-center justify-center gap-2">
            <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-2.5 py-1">
              {Array.from({ length: pet.maxHealth }).map((_, idx) => {
                const isFilled = idx < pet.health;

                return (
                  <HeartIcon
                    key={idx}
                    className={`h-4 w-4 ${isFilled ? "text-rose-400" : "text-white/20"}`}
                  />
                );
              })}
            </div>

            <img
              src={`views://mainview/assets/dino/evolution${pet.evolutionImageIndex}.png`}
              alt="pet"
              className="h-[122px] w-[122px] object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.9)]"
              draggable={false}
            />

            <div className="w-full max-w-[164px] rounded-lg border border-white/15 bg-black/55 px-2.5 py-1.5">
              <div className="mt-1.5 h-1.5 rounded-full border border-white/10 bg-black/65">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500 transition-[width]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="mt-1 text-center text-[9px] uppercase tracking-[0.12em] text-white/75 whitespace-nowrap">
                {evolutionLabel} • {pet.xpIntoCurrentEvolution}/
                {pet.xpForNextEvolution}XP
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
