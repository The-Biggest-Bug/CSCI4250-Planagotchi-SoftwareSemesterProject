import { useEffect, useState } from "react";
import HomePage from "@/mainview/pages/home-page";
import TasksPage from "@/mainview/pages/tasks-page";
import CalendarPage from "@/mainview/pages/calendar-page";
import SettingsPage from "@/mainview/pages/settings-page";
import {
  DEFAULT_DINO_BACKGROUND,
  DEFAULT_EGG_BACKGROUND,
  resolveDinoBackgroundImageUrl,
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
  const [dinoBackground, setDinoBackground] = useState<AppBackgroundDTO>(
    DEFAULT_DINO_BACKGROUND,
  );
  const [pet, setPet] = useState<PetDTO>(
    getPetProgress(getDefaultPetState()),
  );

  useEffect(() => {
    let cancelled = false;

    const loadAppSettings = async () => {
      try {
        const [settings, petState] = await Promise.all([
          electroview.rpc!.request.getAppSettings({}),
          electroview.rpc!.request.getPetState({}),
        ]);
        if (!cancelled) {
          if (settings?.eggColor) {
            setEggFillColor(settings.eggColor);
          }

          if (settings?.eggBackground) {
            setEggBackground(settings.eggBackground);
          }

          if (settings?.dinoBackground) {
            setDinoBackground(settings.dinoBackground);
          }

          if (petState) {
            setPet(petState);
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

  const handleDinoBackgroundChange = async (
    nextBackground: AppBackgroundDTO,
  ) => {
    setDinoBackground(nextBackground);
    try {
      const saved =
        await electroview.rpc!.request.setDinoBackground(nextBackground);
      setDinoBackground(saved);
    } catch {
      // ignore persistence errors; UI will still reflect local change
    }
  };

  const handleResetAllData = async () => {
    const result = await electroview.rpc!.request.resetAllData({});
    setEggFillColor(result.appSettings.eggColor);
    setEggBackground(result.appSettings.eggBackground);
    setDinoBackground(result.appSettings.dinoBackground);
    setPet(result.pet);
    setPage("home");
  };

  const eggBackgroundImageUrl = resolveEggBackgroundImageUrl(eggBackground);
  const dinoBackgroundImageUrl = resolveDinoBackgroundImageUrl(dinoBackground);

  const pages = [
    {
      name: "home",
      component: (
        <HomePage
          navigate={setPage}
          pet={pet}
          eggFillColor={eggFillColor}
          eggBackgroundImageUrl={eggBackgroundImageUrl}
          dinoBackgroundImageUrl={dinoBackgroundImageUrl}
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
          dinoBackground={dinoBackground}
          dinoBackgroundImageUrl={dinoBackgroundImageUrl}
          onEggColorChange={handleEggColorChange}
          onEggBackgroundChange={handleEggBackgroundChange}
          onDinoBackgroundChange={handleDinoBackgroundChange}
          onResetAllData={handleResetAllData}
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
