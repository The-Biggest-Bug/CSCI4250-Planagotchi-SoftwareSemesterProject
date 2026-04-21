import { useEffect, useState } from "react";
import HomePage from "@/mainview/pages/home-page";
import TasksPage from "@/mainview/pages/tasks-page";
import CalendarPage from "@/mainview/pages/calendar-page";
import SettingsPage from "@/mainview/pages/settings-page";
import {
  DEFAULT_PET_BACKGROUND,
  DEFAULT_EGG_BACKGROUND,
  resolvePetBackgroundImageUrl,
  resolveEggBackgroundImageUrl,
} from "@/mainview/backgrounds";
import type { PageName } from "@/mainview/types";
import type { AppBackgroundDTO, PetDTO } from "@/shared/rpc";
import { electroview } from "@/shared/electrobun";
import { getPetProgress, getDefaultPetState } from "@/types/pet";

export default function App() {
  const [page, setPage] = useState<PageName>("home");
  const [eggFillColor, setEggFillColor] = useState("#CAF0FE");
  const [eggBackground, setEggBackground] = useState(DEFAULT_EGG_BACKGROUND);
  const [petBackground, setPetBackground] = useState<AppBackgroundDTO>(
    DEFAULT_PET_BACKGROUND,
  );
  const [hardMode, setHardMode] = useState(false);
  const [pet, setPet] = useState<PetDTO>(getPetProgress(getDefaultPetState()));

  useEffect(() => {
    let cancelled = false;

    const loadAppSettings = async () => {
      try {
        const settings = await electroview.rpc!.request.getAppSettings({});
        if (!cancelled) {
          if (settings?.eggColor) {
            setEggFillColor(settings.eggColor);
          }

          if (settings?.eggBackground) {
            setEggBackground(settings.eggBackground);
          }

          if (settings?.petBackground) {
            setPetBackground(settings.petBackground);
          }

          if (typeof settings?.hardMode === "boolean") {
            setHardMode(settings.hardMode);
          }
        }
      } catch {
        // fall back to default settings on error
      }
    };

    loadAppSettings();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (page !== "home") {
      return;
    }

    let cancelled = false;

    const loadPetState = async () => {
      try {
        const petState = await electroview.rpc!.request.getPetState({});
        if (!cancelled && petState) {
          setPet(petState);
        }
      } catch {
        // ignore refresh errors and keep the current local pet state
      }
    };

    loadPetState();

    return () => {
      cancelled = true;
    };
  }, [page]);

  const handleEggColorChange = async (color: string) => {
    setEggFillColor(color);
    try {
      await electroview.rpc!.request.setEggColor({ color });
    } catch {
      // ignore persistence errors; UI will still reflect local change
    }
  };

  const handleEggBackgroundChange = async (value: string) => {
    setEggBackground(value);
    try {
      const saved = await electroview.rpc!.request.setEggBackground({ value });
      setEggBackground(saved.value);
    } catch {
      // ignore persistence errors; UI will still reflect local change
    }
  };

  const handlePetBackgroundChange = async (
    nextBackground: AppBackgroundDTO,
  ) => {
    setPetBackground(nextBackground);
    try {
      const saved =
        await electroview.rpc!.request.setPetBackground(nextBackground);
      setPetBackground(saved);
    } catch {
      // ignore persistence errors; UI will still reflect local change
    }
  };

  const handleHardModeChange = async (enabled: boolean) => {
    setHardMode(enabled);
    try {
      const saved = await electroview.rpc!.request.setHardMode({ enabled });
      setHardMode(saved.enabled);
      const nextPet = await electroview.rpc!.request.getPetState({});
      if (nextPet) {
        setPet(nextPet);
      }
    } catch {
      // ignore persistence errors; UI will still reflect local change
    }
  };

  const handleResetAllData = async () => {
    const result = await electroview.rpc!.request.resetAllData({});
    setEggFillColor(result.appSettings.eggColor);
    setEggBackground(result.appSettings.eggBackground);
    setPetBackground(result.appSettings.petBackground);
    setHardMode(result.appSettings.hardMode);
    setPet(result.pet);
    setPage("home");
  };

  const eggBackgroundImageUrl = resolveEggBackgroundImageUrl(eggBackground);
  const petBackgroundImageUrl = resolvePetBackgroundImageUrl(petBackground);

  const pages = [
    {
      name: "home",
      component: (
        <HomePage
          navigate={setPage}
          pet={pet}
          eggFillColor={eggFillColor}
          eggBackgroundImageUrl={eggBackgroundImageUrl}
          petBackgroundImageUrl={petBackgroundImageUrl}
        />
      ),
    },
    {
      name: "tasks",
      component: (
        <TasksPage
          navigate={setPage}
          onPetStateChange={setPet}
          eggFillColor={eggFillColor}
          eggBackgroundImageUrl={eggBackgroundImageUrl}
        />
      ),
    },
    {
      name: "calendar",
      component: (
        <CalendarPage
          navigate={setPage}
          onPetStateChange={setPet}
          eggFillColor={eggFillColor}
          eggBackgroundImageUrl={eggBackgroundImageUrl}
        />
      ),
    },
    {
      name: "settings",
      component: (
        <SettingsPage
          navigate={setPage}
          eggFillColor={eggFillColor}
          eggBackground={eggBackground}
          eggBackgroundImageUrl={eggBackgroundImageUrl}
          petBackground={petBackground}
          petBackgroundImageUrl={petBackgroundImageUrl}
          onEggColorChange={handleEggColorChange}
          onEggBackgroundChange={handleEggBackgroundChange}
          onPetBackgroundChange={handlePetBackgroundChange}
          onResetAllData={handleResetAllData}
          hardMode={hardMode}
          onHardModeChange={handleHardModeChange}
        />
      ),
    },
  ];
  return (
    <div className="h-screen text-white flex items-center justify-center">
      <div className="w-full aspect-square max-w-full max-h-full">
        {pages.find((p) => p.name === page)?.component}
      </div>
    </div>
  );
}
