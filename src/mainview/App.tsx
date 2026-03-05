import { useState } from "react";
import HomePage from "@/mainview/pages/home-page";
import TasksPage from "@/mainview/pages/tasks-page";
import SettingsPage from "@/mainview/pages/settings-page";

export default function App() {
  const [page, setPage] = useState("home");
  const [eggFillColor, setEggFillColor] = useState("#fff000");

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
          onEggColorChange={setEggFillColor}
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
