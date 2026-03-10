import { Electroview } from "electrobun/view";
import type { MainViewRPC } from "./rpc";

export const rpc = Electroview.defineRPC<MainViewRPC>({
  handlers: {
    requests: {},
    messages: {},
  },
});

export const electroview = new Electroview({ rpc });
