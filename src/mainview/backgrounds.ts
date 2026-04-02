import type { AppBackgroundDTO } from "@/shared/rpc";

export interface BackgroundOption {
  id: string;
  label: string;
  imageUrl: string;
}

const ASSET_ROOT = "views://mainview/assets";

export const EGG_BACKGROUND_OPTIONS: BackgroundOption[] = [
  {
    id: "egg-stars-and-dots",
    label: "Stars and Dots",
    imageUrl: `${ASSET_ROOT}/egg-bg/stars-and-dots.png`,
  },
  {
    id: "egg-triangles",
    label: "Triangles",
    imageUrl: `${ASSET_ROOT}/egg-bg/triangles.webp`,
  },
];

export const DINO_BACKGROUND_OPTIONS: BackgroundOption[] = [
  {
    id: "dino-landscape",
    label: "Landscape",
    imageUrl: `${ASSET_ROOT}/dino-bg/landscape.webp`,
  },
  {
    id: "dino-lavender",
    label: "Lavender",
    imageUrl: `${ASSET_ROOT}/dino-bg/lavender.webp`,
  },
  {
    id: "dino-slimes",
    label: "Slimes",
    imageUrl: `${ASSET_ROOT}/dino-bg/slimes.webp`,
  },
];

export const DEFAULT_EGG_BACKGROUND = "egg-triangles";
export const DEFAULT_DINO_BACKGROUND: AppBackgroundDTO = {
  kind: "preset",
  value: "dino-landscape",
};

const eggBackgroundMap = new Map(
  EGG_BACKGROUND_OPTIONS.map((option) => [option.id, option]),
);
const dinoBackgroundMap = new Map(
  DINO_BACKGROUND_OPTIONS.map((option) => [option.id, option]),
);

export function resolveEggBackgroundImageUrl(
  eggBackgroundValue: string | null | undefined,
) {
  if (eggBackgroundValue?.startsWith("data:")) return eggBackgroundValue;

  return (
    eggBackgroundMap.get(eggBackgroundValue || "")?.imageUrl ||
    eggBackgroundMap.get(DEFAULT_EGG_BACKGROUND)!.imageUrl
  );
}

export function resolveDinoBackgroundImageUrl(
  dinoBackground: AppBackgroundDTO | null | undefined,
) {
  if (dinoBackground?.kind === "custom" && dinoBackground.value) {
    return dinoBackground.value;
  }

  return (
    dinoBackgroundMap.get(dinoBackground?.value || "")?.imageUrl ||
    dinoBackgroundMap.get(DEFAULT_DINO_BACKGROUND.value)!.imageUrl
  );
}
