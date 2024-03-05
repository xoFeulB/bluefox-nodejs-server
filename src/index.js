import open, { apps } from "open";
import { Gate } from "@xofeulb/bluefox-server/Gate";
import { Server } from "@xofeulb/bluefox-server/Server";

const BlueFoxServer = {
  Gate: Gate,
  Server: Server,
  sleep: (msec) => new Promise((resolve) => setTimeout(resolve, msec)),
  open: {
    chrome: async (url, option = []) => {
      await open(url, { app: { name: apps.chrome, arguments: option } });
    },
    edge: async (url, option = []) => {
      await open(url, { app: { name: apps.edge, arguments: option } });
    },
  }
};

export { BlueFoxServer };