import {
  CalendarDaysIcon,
  ListBulletIcon,
  Cog6ToothIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import Layout from "@/mainview/layout";
import type { ButtonConfig, Navigate } from "@/mainview/types";
import type { PetDTO, PetMoodDTO } from "@/shared/rpc";

interface HomePageProps {
  navigate: Navigate;
  pet: PetDTO;
  eggFillColor: string;
  eggBackgroundImageUrl: string;
  petBackgroundImageUrl: string;
}

const EVOLUTION_LABELS = ["EGGIE", "LEGGIE", "STEGGIE", "DRAGGIE"];
const MOOD_LABELS: Record<PetMoodDTO, string> = {
  idle: "IDLE",
  sad: "SAD",
  angry: "ANGRY",
};
const MOOD_DOT_CLASSNAMES: Record<PetMoodDTO, string> = {
  idle: "bg-emerald-400",
  sad: "bg-amber-300",
  angry: "bg-rose-400",
};

export default function HomePage({
  navigate,
  pet,
  eggFillColor,
  eggBackgroundImageUrl,
  petBackgroundImageUrl,
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
  const moodLabel = MOOD_LABELS[pet.mood] ?? pet.mood.toUpperCase();

  const petImageUrl =
    pet.kind === "hamster"
      ? pet.health > 0
        ? "views://mainview/assets/hamster/hamster.png"
        : "views://mainview/assets/hamster/death.png"
      : `views://mainview/assets/dino/dino-${pet.mood}/evolution${pet.evolutionImageIndex}.png`;

  return (
    <Layout
      buttons={buttons}
      eggFillColor={eggFillColor}
      eggBackgroundImageUrl={eggBackgroundImageUrl}
      petBackgroundImageUrl={petBackgroundImageUrl}
    >
      <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
        <div className="relative flex h-full w-full items-center justify-center px-3 py-2">
          <div className="flex h-full w-full max-w-[192px] -translate-y-2 flex-col items-center justify-between py-3">
            <div className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/60 px-2 py-0.5">
              {Array.from({ length: pet.maxHealth }).map((_, idx) => (
                <HeartIcon
                  key={idx}
                  className={`h-3.5 w-3.5 ${idx < pet.health ? "text-rose-400" : "text-white/20"}`}
                />
              ))}
            </div>

            {pet.kind === "hamster" ? null : (
              <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-2 py-0.5 text-[8px] uppercase tracking-[0.12em] text-white/75">
                <span
                  className={`h-2 w-2 rounded-full ${MOOD_DOT_CLASSNAMES[pet.mood]}`}
                />
                <span className="truncate">{moodLabel}</span>
                <span>{pet.productivityScore}%</span>
              </div>
            )}

            <img
              src={petImageUrl}
              alt="pet"
              className="my-1.5 h-[108px] w-[108px] object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.9)]"
              draggable={false}
            />

            {pet.kind === "hamster" ? null : (
              <div className="w-full max-w-[156px] rounded-lg border border-white/15 bg-black/55 px-2 py-1">
                <div className="mt-1 h-1.5 rounded-full border border-white/10 bg-black/65">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-300 to-emerald-500 transition-[width]"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="mt-1 text-center text-[8px] uppercase tracking-[0.12em] text-white/75 whitespace-nowrap">
                  {evolutionLabel} • {pet.xpIntoCurrentEvolution}/
                  {pet.xpForNextEvolution}XP
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
