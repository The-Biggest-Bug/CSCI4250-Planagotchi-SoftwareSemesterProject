import { ApplicationMenu, BrowserWindow, Updater, Utils } from "electrobun/bun";
import config from "../../electrobun.config";

const APP_NAME = config.app.name;
const DEV_SERVER_PORT = 5173;
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`;

// check if Vite dev server is running for HMR
async function getMainViewUrl(): Promise<string> {
  const channel = await Updater.localInfo.channel();
  if (channel !== "dev") return "views://mainview/index.html";

  try {
    await fetch(DEV_SERVER_URL, { method: "HEAD" });
    console.log(`HMR enabled: Using Vite dev server at ${DEV_SERVER_URL}`);
    return DEV_SERVER_URL;
  } catch {
    console.log("Vite dev server not running. Run 'bun run dev:hmr' for HMR.");
    return "views://mainview/index.html";
  }
}

const url = await getMainViewUrl();

// add cmd+q support for macOS
ApplicationMenu.setApplicationMenu([
  {
    submenu: [{ role: "quit", accelerator: "q" }],
  },
]);

// main window options (small "pet" window)
const mainWindow = new BrowserWindow({
  title: APP_NAME,
  url,
  frame: {
    width: 360,
    height: 360,
    x: 200,
    y: 200,
  },
  transparent: true,
  titleBarStyle: "hidden",
});

mainWindow.on("close", () => Utils.quit());

console.log(`${APP_NAME} started!`);
