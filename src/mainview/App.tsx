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
import type { AppBackgroundDTO } from "@/shared/rpc";
import { electroview } from "@/shared/electrobun";

export default function App() {
  const [page, setPage] = useState<PageName>("home");
  const [eggFillColor, setEggFillColor] = useState("#CAF0FE");
  const [eggBackground, setEggBackground] = useState(DEFAULT_EGG_BACKGROUND);
  const [dinoBackground, setDinoBackground] = useState<AppBackgroundDTO>(
    DEFAULT_DINO_BACKGROUND,
  );

  useEffect(() => {
    let cancelled = false;

    const loadAppSettings = async () => {
      try {
        const result = await electroview.rpc!.request.getAppSettings({});
        if (!cancelled) {
          if (result?.eggColor) {
            setEggFillColor(result.eggColor);
          }

          if (result?.eggBackground) {
            setEggBackground(result.eggBackground);
          }

          if (result?.dinoBackground) {
            setDinoBackground(result.dinoBackground);
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

  const eggBackgroundImageUrl = resolveEggBackgroundImageUrl(eggBackground);
  const dinoBackgroundImageUrl = resolveDinoBackgroundImageUrl(dinoBackground);

  const pages = [
    {
      name: "home",
      component: (
        <HomePage
          navigate={setPage}
          eggFillColor={eggFillColor}
          eggBackgroundImageUrl={eggBackgroundImageUrl}
          dinoBackgroundImageUrl={dinoBackgroundImageUrl}
        />
      ),
    },
    {
      name: "tasks",
      component: <TasksPage navigate={setPage} eggFillColor={eggFillColor} />,
    },
    {
      name: "calendar",
      component: (
        <CalendarPage navigate={setPage} eggFillColor={eggFillColor} />
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
