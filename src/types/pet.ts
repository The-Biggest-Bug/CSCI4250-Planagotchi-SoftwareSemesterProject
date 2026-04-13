export const PET_MAX_HEALTH = 6;
export const PET_INITIAL_HEALTH = Math.ceil(PET_MAX_HEALTH / 2);
export const PET_XP_PER_TASK = 20;
export const PET_HEALTH_LOSS_PER_MISSED_TASK = 2;
export const PET_XP_PER_EVOLUTION = 100;
export const PET_MAX_EVOLUTION_IMAGE_INDEX = 2;

export interface StoredPetState {
  health: number;
  xp: number;
}

export interface PetProgress {
  health: number;
  maxHealth: number;
  xp: number;
  evolutionLevel: number;
  evolutionImageIndex: number;
  xpIntoCurrentEvolution: number;
  xpForNextEvolution: number;
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

export function getPetProgress(pet: StoredPetState): PetProgress {
  return {
    health: clampPetHealth(pet.health),
    maxHealth: PET_MAX_HEALTH,
    xp: Math.max(0, pet.xp),
    evolutionLevel: getEvolutionLevel(pet.xp),
    evolutionImageIndex: getEvolutionImageIndex(pet.xp),
    xpIntoCurrentEvolution: getXpIntoCurrentEvolution(pet.xp),
    xpForNextEvolution: PET_XP_PER_EVOLUTION,
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
