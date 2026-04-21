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

export const PET_BACKGROUND_OPTIONS: BackgroundOption[] = [
  {
    id: "dino-landscape",
    label: "Landscape",
    imageUrl: `${ASSET_ROOT}/pet-bg/landscape.webp`,
  },
  {
    id: "dino-lavender",
    label: "Lavender",
    imageUrl: `${ASSET_ROOT}/pet-bg/lavender.webp`,
  },
  {
    id: "dino-slimes",
    label: "Slimes",
    imageUrl: `${ASSET_ROOT}/pet-bg/slimes.webp`,
  },
];

export const DEFAULT_EGG_BACKGROUND = "egg-triangles";
export const DEFAULT_PET_BACKGROUND: AppBackgroundDTO = {
  kind: "preset",
  value: "dino-landscape",
};

const eggBackgroundMap = new Map(
  EGG_BACKGROUND_OPTIONS.map((option) => [option.id, option]),
);
const petBackgroundMap = new Map(
  PET_BACKGROUND_OPTIONS.map((option) => [option.id, option]),
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

export function resolvePetBackgroundImageUrl(
  petBackground: AppBackgroundDTO | null | undefined,
) {
  if (petBackground?.kind === "custom" && petBackground.value) {
    return petBackground.value;
  }

  return (
    petBackgroundMap.get(petBackground?.value || "")?.imageUrl ||
    petBackgroundMap.get(DEFAULT_PET_BACKGROUND.value)!.imageUrl
  );
}
