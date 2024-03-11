# bluefox-nodejs-server

```bash
npm i @xofeulb/bluefox-server
```

```javascript
import { BlueFoxServer } from "../src/index.js";
import fs from "fs";
import child_process from "child_process";
let sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

if (!fs.existsSync("./test/BlueFoxScript-Examples")) {
  child_process.execSync("git clone https://github.com/xoFeulB/BlueFoxScript-Examples.git ./test/BlueFoxScript-Examples");
} else {
  child_process.execSync("git -C ./test/BlueFoxScript-Examples pull");
}

const gate = new BlueFoxServer.Gate(9999);
const server = new BlueFoxServer.Server("./test/BlueFoxScript-Examples", "ws://127.0.0.1:9999");

gate.start();
server.start();

let BlueFox = await gate.webSocketServer.openChrome("jmkijjjfiimebohbccipaahimknabkfe");
let config = async () => {
  // window scope
  url = "https://ooo.bluefox.ooo/BlueFoxDemo/8bit.html"; // or window.url
  blueFoxScript = await new BlueFoxScript();
};
let callable = async () => {
  let tab = await blueFoxScript.createWindow(url);
  let result = await tab.dispatchScriptTillTrue(
    // in https://ooo.bluefox.ooo/BlueFoxDemo/8bit.html scope
    () => {
      if (document.querySelector("[out]").textContent == "#80") {
        return [...document.querySelectorAll("input")].map((_) => {
          return {
            testid: _.attributes["data-testid"].value,
            checked: _.checked,
          }
        });
      } else {
        return false;
      }
    },
    (max_polling = 100)
  );
  alert(JSON.stringify(result.result.value, null, 4));
  return result.result.value;
}

await sleep(5000);
await BlueFox.runScript(`(${config.toString()})();`);
let result = await BlueFox.runScript(
  `(${callable.toString()})();`
);
if (JSON.stringify({
  type: 'object',
  value: [
    { checked: true, testid: 'bit-8' },
    { checked: false, testid: 'bit-7' },
    { checked: false, testid: 'bit-6' },
    { checked: false, testid: 'bit-5' },
    { checked: false, testid: 'bit-4' },
    { checked: false, testid: 'bit-3' },
    { checked: false, testid: 'bit-2' },
    { checked: false, testid: 'bit-1' }
  ]
}) == JSON.stringify(result.result)) {
  console.info("OK");
} else {
  console.info("NG");
}
```
