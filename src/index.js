import { GateServer } from "@xofeulb/bluefox-server/Gate";
import { WorkspaceServer } from "@xofeulb/bluefox-server/Server";

const BlueFoxServer = {
  GateServer: GateServer,
  WorkspaceServer: WorkspaceServer,
  sleep: (msec) => new Promise((resolve) => setTimeout(resolve, msec)),
};

export { BlueFoxServer };
