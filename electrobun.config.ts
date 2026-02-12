import type { ElectrobunConfig } from "electrobun";

export default {
  app: {
    name: "Plan-a-Gotchi",
    identifier: "planagotchi.app",
    version: "0.0.1",
  },
  build: {
    // vite builds to dist/, copy from there
    copy: {
      "dist/index.html": "views/mainview/index.html",
      "dist/assets": "views/mainview/assets",
    },
    mac: {
      bundleCEF: false,
    },
    linux: {
      bundleCEF: false,
    },
    win: {
      bundleCEF: false,
    },
  },
} satisfies ElectrobunConfig;
