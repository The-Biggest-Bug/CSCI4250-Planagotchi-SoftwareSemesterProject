export const PET_MAX_HEALTH = 6;
export const PET_INITIAL_HEALTH = Math.ceil(PET_MAX_HEALTH / 2);
export const PET_XP_PER_TASK = 20;
export const PET_HEALTH_LOSS_PER_MISSED_TASK = 2;
export const PET_XP_PER_EVOLUTION = 100;
export const PET_MAX_EVOLUTION_IMAGE_INDEX = 3;
export const PET_IDLE_MOOD_THRESHOLD = 70;
export const PET_SAD_MOOD_THRESHOLD = 40;

export type PetMood = "idle" | "sad" | "angry";
export type PetKind = "dino" | "hamster";

export interface StoredPetState {
  health: number;
  xp: number;
}

export interface ProductivitySnapshot {
  totalTodos: number;
  completedTodos: number;
  overdueTodos: number;
}

export interface PetProgress {
  kind: PetKind;
  health: number;
  maxHealth: number;
  xp: number;
  evolutionLevel: number;
  evolutionImageIndex: number;
  xpIntoCurrentEvolution: number;
  xpForNextEvolution: number;
  mood: PetMood;
  productivityScore: number;
  streakDays: number;
}

export function getDefaultPetState(): StoredPetState {
  return {
    health: PET_INITIAL_HEALTH,
    xp: 0,
  };
}

export function clampPetHealth(health: number) {
  return Math.max(0, Math.min(PET_MAX_HEALTH, Math.round(health)));
}

export function getEvolutionLevel(xp: number) {
  return Math.max(0, Math.floor(xp / PET_XP_PER_EVOLUTION));
}

export function getEvolutionImageIndex(xp: number) {
  return Math.min(getEvolutionLevel(xp), PET_MAX_EVOLUTION_IMAGE_INDEX);
}

export function getXpIntoCurrentEvolution(xp: number) {
  return Math.max(0, xp % PET_XP_PER_EVOLUTION);
}

function clampUnit(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getProductivityScore(
  pet: StoredPetState,
  productivity: ProductivitySnapshot,
) {
  const totalTodos = Math.max(0, Math.round(productivity.totalTodos));
  const completedTodos = Math.max(
    0,
    Math.min(totalTodos, Math.round(productivity.completedTodos)),
  );
  const overdueTodos = Math.max(
    0,
    Math.min(totalTodos, Math.round(productivity.overdueTodos)),
  );
  const healthRatio = clampUnit(clampPetHealth(pet.health) / PET_MAX_HEALTH);

  if (totalTodos === 0) {
    return Math.round((0.7 + healthRatio * 0.3) * 100);
  }

  const completionRatio = completedTodos / totalTodos;
  const overdueRatio = overdueTodos / totalTodos;
  const score =
    completionRatio * 0.45 + (1 - overdueRatio) * 0.35 + healthRatio * 0.2;

  return Math.round(clampUnit(score) * 100);
}

export function getPetMood(productivityScore: number): PetMood {
  if (productivityScore >= PET_IDLE_MOOD_THRESHOLD) {
    return "idle";
  }

  if (productivityScore >= PET_SAD_MOOD_THRESHOLD) {
    return "sad";
  }

  return "angry";
}

export function getPetProgress(
  pet: StoredPetState,
  productivity: ProductivitySnapshot = {
    totalTodos: 0,
    completedTodos: 0,
    overdueTodos: 0,
  },
): PetProgress {
  const productivityScore = getProductivityScore(pet, productivity);

  return {
    kind: "dino",
    health: clampPetHealth(pet.health),
    maxHealth: PET_MAX_HEALTH,
    xp: Math.max(0, pet.xp),
    evolutionLevel: getEvolutionLevel(pet.xp),
    evolutionImageIndex: getEvolutionImageIndex(pet.xp),
    xpIntoCurrentEvolution: getXpIntoCurrentEvolution(pet.xp),
    xpForNextEvolution: PET_XP_PER_EVOLUTION,
    mood: getPetMood(productivityScore),
    productivityScore,
    streakDays: 0,
  };
}

export function getHamsterProgress(
  pet: StoredPetState,
  productivity: ProductivitySnapshot = {
    totalTodos: 0,
    completedTodos: 0,
    overdueTodos: 0,
  },
): PetProgress {
  const totalTodos = Math.max(0, Math.round(productivity.totalTodos));
  const completedTodos = Math.max(
    0,
    Math.min(totalTodos, Math.round(productivity.completedTodos)),
  );
  const completionScore =
    totalTodos === 0 ? 100 : Math.round((completedTodos / totalTodos) * 100);

  return {
    kind: "hamster",
    health: Math.max(0, Math.min(1, Math.round(pet.health))),
    maxHealth: 1,
    xp: 0,
    evolutionLevel: 0,
    evolutionImageIndex: 0,
    xpIntoCurrentEvolution: 0,
    xpForNextEvolution: 1,
    mood: "idle",
    productivityScore: Math.max(0, Math.min(100, completionScore)),
    streakDays: 0,
  };
}

export function rewardPetForCompletedTask(pet: StoredPetState): StoredPetState {
  return {
    health: clampPetHealth(pet.health + 1),
    xp: Math.max(0, pet.xp) + PET_XP_PER_TASK,
  };
}

export function penalizePetForMissedTask(pet: StoredPetState): StoredPetState {
  return {
    health: clampPetHealth(pet.health - PET_HEALTH_LOSS_PER_MISSED_TASK),
    xp: Math.max(0, pet.xp),
  };
}
