import { useState } from "react";
import {
  ListBulletIcon,
  Cog6ToothIcon,
  HomeIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import { Button } from "@/mainview/components/ui/button";
import type { Pet } from "@/types/pet";
import TodoList from "@/mainview/components/TodoList";

interface PetDisplayProps {
  pet: Pet;
}

export default function PetDisplay({}: PetDisplayProps) {
  const [showTodos, setShowTodos] = useState(false);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between">
      <div className="flex-1 flex items-center justify-center w-full">
        {showTodos ? (
          <div className="w-full h-full flex items-stretch">
            <TodoList />
          </div>
        ) : (
          <div className="w-3/5 flex flex-col items-center justify-center gap-3">
            <div className="flex justify-center gap-1">
              {Array.from({ length: 5 }).map((_, idx) => (
                <HeartIcon
                  key={idx}
                  className="w-4 h-4 text-rose-400 mb-[-12px]"
                />
              ))}
            </div>

            <div className="aspect-square flex items-center justify-center w-full">
              <img
                src="views://mainview/assets/evolution0.png"
                alt="eggy image"
                className="w-4/5 h-4/5 object-contain"
                draggable={false}
              />
            </div>
          </div>
        )}
      </div>

      <div className="pb-4 pt-2 flex items-center justify-center gap-4">
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Go home"
          className="h-11 w-11 rounded-full"
          onClick={() => setShowTodos(false)}
        >
          <HomeIcon className="w-5 h-5" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Toggle todo list"
          className="h-11 w-11 rounded-full"
          onClick={() => setShowTodos((v) => !v)}
        >
          <ListBulletIcon className="w-5 h-5" />
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Open settings"
          className="h-11 w-11 rounded-full"
        >
          <Cog6ToothIcon className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
