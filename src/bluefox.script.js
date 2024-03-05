import { BlueFoxJs } from "@xofeulb/bluefox-js";


export class BlueFoxScript {
  constructor() {
    this.tabs = {};
    this.connector = new Connector();

    return new Promise((resolve, reject) => {
      this.init(resolve);
    });
  }

  // interface
  async runWorkspaceScript() { }
  async getWorkspaceFile() { }
  async runScript() { }

  async init(resolve) {
    this.tabs = {
      info: {},
      reload: async () => {
        this.tabs.info = await (async () => {
          let tabInfo = [
            ...(await chrome.tabs.query({ url: "<all_urls>" })),
          ].map((_) => {
            _.windowId = _.windowId;
            _.id = _.id;
            _.url = new URL(_.url);
            _.dispatch = {
              script: async (callable) => {
                await this.connector.load(_.id);
                return (await this.connector.post({
                  type: "BlueFox.Dispatch.Script",
                  object: `(${callable.toString()})();`,
                })).object;
              },
              action: async (object) => {
                await this.connector.load(_.id);
                return await this.connector.post({
                  type: "BlueFox.Dispatch.Action",
                  object: JSON.stringify(object),
                });
              },
              screenshot: async (config = {
                format: "png",
                captureBeyondViewport: true,
              }) => {
                await this.connector.load(_.id);
                return await this.connector.post({
                  type: "BlueFox.CaptureWindow",
                  object: config,
                });
              },
              tillScriptTrue: async (callable, max_polling = 20) => {
                return new Promise((resolve, reject) => {
                  let polling_count = max_polling;
                  let polling = () => {
                    setTimeout(async () => {
                      try {
                        if (!polling_count--) {
                          reject();
                          return;
                        }
                        await this.connector.load(_.id);
                        let R = (await this.connector.post({
                          type: "BlueFox.Dispatch.Script",
                          object: `(${callable.toString()})();`,
                        })).object;
                        if (!R.result.value) {
                          polling();
                        } else {
                          resolve(R);
                        }
                      } catch (e) {
                        polling();
                      }
                    }, 100)
                  }
                  polling();
                });
              },
              tails: (config) => {
                let R = new (class extends BlueFoxJs.Automation.BlueFoxScript {
                  constructor() {
                    super(config);
                    this.connector = new Connector();
                    return this;
                  }
                  async getProperties(selector = this.selector) {
                    await this.connector.load(_.id);
                    let message = await this.connector.post({
                      type: "BlueFox.GetElementProperties",
                      object: {
                        selector: selector,
                      },
                    });
                    return message.object;
                  }
                  async run(object) {
                    let R = await _.dispatch.action(
                      Object.assign(this.tail, object)
                    );
                    return R.object;
                  }
                  async runTillNextOnLoad(object, max_polling = 20) {
                    let uuid_prev = await new Promise((resolve, reject) => {
                      let polling_count = max_polling;
                      let polling = () => {
                        setTimeout(async () => {
                          try {
                            if (!polling_count--) {
                              reject();
                              return;
                            }
                            await this.connector.load(_.id);
                            let uuid = (await this.connector.post({
                              type: "Tab.windowOnLoad",
                              object: {},
                            })).object;
                            if (!uuid) {
                              polling();
                            } else {
                              resolve(uuid);
                            }
                          } catch (e) {
                            polling();
                          }
                        }, 100)
                      }
                      polling();
                    });
                    let R = _.dispatch.action(
                      Object.assign(this.tail, object)
                    );
                    return await new Promise((resolve, reject) => {
                      let polling_count = max_polling;
                      let polling = () => {
                        setTimeout(async () => {
                          try {
                            if (!polling_count--) {
                              reject();
                              return;
                            }
                            await this.connector.load(_.id);
                            let uuid = (await this.connector.post({
                              type: "Tab.windowOnLoad",
                              object: {},
                            })).object;
                            if (!uuid || uuid_prev == uuid) {
                              polling();
                            } else {
                              resolve(await R);
                            }
                          } catch (e) {
                            polling();
                          }
                        }, 100)
                      }
                      polling();
                    });
                  }
                  saveTail(title, description, object) {
                    let R = JSON.parse(JSON.stringify(this.tail));

                    R.meta.title = title;
                    R.meta.description = description;

                    Object.assign(document.createElement("a"), {
                      href: window.URL.createObjectURL(
                        new Blob([JSON.stringify(Object.assign(R, object), null, 4)], {
                          type: "application/json",
                        })
                      ),
                      download: `${title}.json`,
                    }).click();
                    return this;
                  }
                  saveJSON(file_name, object) {
                    Object.assign(document.createElement("a"), {
                      href: window.URL.createObjectURL(
                        new Blob([JSON.stringify(object, null, 4)], {
                          type: "application/json",
                        })
                      ),
                      download: `${file_name}.json`,
                    }).click();
                    return this;
                  }
                })();
                return R;
              },
              addEventListeners: async (selector, event_type, callback) => {
                let uuid = crypto.randomUUID();
                await this.connector.load(_.id);
                this.connector.connector.onMessage.addListener((P) => {
                  if (P.object.uuid == uuid) {
                    callback(P.object.object);
                  }
                });
                return (await this.connector.post({
                  type: "BlueFoxScript.AddEventListener",
                  object: {
                    uuid: uuid,
                    selector: selector,
                    event_type: event_type
                  },
                })).object;
              },
            };
            _.close = async () => {
              await chrome.runtime.sendMessage({
                type: "Tab.removeWindow",
                object: _.windowId
              });
            };
            _.reload = async () => {
              await chrome.tabs.reload(_.id);
            };
            return _;
          });
          return tabInfo;
        })();
      },
      get: (regexp) => {
        let regexp_object = new RegExp(regexp, "g");
        return this.tabs.info.filter((_) => {
          return regexp_object.test(_.url.href);
        });
      },
      create: async (url, max_polling = 20, option = {
        focused: false,
        top: 0,
        left: 0,
      }) => {
        let created = await chrome.windows.create(
          Object.assign(
            {
              url: url,
            }, option
          )
        );

        await new Promise((resolve, reject) => {
          let polling_count = max_polling;
          let polling = () => {
            setTimeout(async () => {
              try {
                if (!polling_count--) {
                  reject();
                  return;
                }
                await this.connector.load(created.tabs[0].id);
                let uuid = (await this.connector.post({
                  type: "Tab.windowOnLoad",
                  object: {},
                })).object;
                if (!uuid) {
                  polling();
                } else {
                  resolve(uuid);
                }
              } catch (e) {
                polling();
              }
            }, 100)
          }
          polling();
        });

        await this.tabs.reload();
        let tab = this.tabs.info.filter((_) => {
          return _.id == created.tabs[0].id;
        })[0];
        return tab;
      },
    };
    await this.tabs.reload();
    resolve(this);
  }
};