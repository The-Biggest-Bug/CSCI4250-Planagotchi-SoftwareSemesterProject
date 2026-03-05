import { useEffect, useState } from "react";
import HomePage from "@/mainview/pages/home-page";
import TasksPage from "@/mainview/pages/tasks-page";
import SettingsPage from "@/mainview/pages/settings-page";
import { electroview } from "@/shared/electrobun";

export default function App() {
  const [page, setPage] = useState("home");
  const [eggFillColor, setEggFillColor] = useState("#CAF0FE");

  useEffect(() => {
    let cancelled = false;

    const loadEggColor = async () => {
      try {
        const result = await electroview.rpc!.request.getEggColor({});
        if (!cancelled && result?.color) {
          setEggFillColor(result.color);
        }
      } catch {
        // fall back to default color on error
      }
    };

    loadEggColor();

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

  const pages = [
    {
      name: "home",
      component: <HomePage navigate={setPage} eggFillColor={eggFillColor} />,
    },
    {
      name: "tasks",
      component: <TasksPage navigate={setPage} eggFillColor={eggFillColor} />,
    },
    {
      name: "settings",
      component: (
        <SettingsPage
          navigate={setPage}
          eggFillColor={eggFillColor}
          onEggColorChange={handleEggColorChange}
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
