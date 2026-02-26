import Egg from "@/mainview/components/Egg";
import PetDisplay from "@/mainview/components/PetDisplay";
import type { Pet } from "@/types/pet";

export default function App() {
  const initialPet = {
    mood: "neutral",
    xp: 0,
  } satisfies Pet;

  return (
    <div className="h-screen text-white flex items-center justify-center">
      <div className="w-full aspect-square max-w-full max-h-full">
        <Egg>
          <PetDisplay pet={initialPet} />
        </Egg>
      </div>
    </div>
  );
}
