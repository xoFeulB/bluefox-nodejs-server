import { Gate } from "@xofeulb/bluefox-server/Gate";
import { Server } from "@xofeulb/bluefox-server/Server";

const BlueFoxServer = {
  Gate: Gate,
  Server: Server,
  sleep: (msec) => new Promise((resolve) => setTimeout(resolve, msec)),
};

export { BlueFoxServer };
