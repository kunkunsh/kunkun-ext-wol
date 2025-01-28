import {
  Action,
  app,
  db,
  Child,
  DenoCommand,
  expose,
  Form,
  fs,
  Icon,
  IconEnum,
  List,
  path,
  RPCChannel,
  shell,
  toast,
  ui,
  WorkerExtension,
} from "@kksh/api/ui/worker";
import * as v from "valibot";
import type { API } from "./types";
import { WakeOnLanHost, WakeOnLanHostType } from "./models";

async function getRpcAPI() {
  const downloadDir = await path.downloadDir();
  const { rpcChannel, process, command } = await shell.createDenoRpcChannel<
    object,
    API
  >(
    "$EXTENSION/deno-src/index.ts",
    [],
    {
      allowAllEnv: true,
      allowAllFfi: true,
      allowAllRead: true,
      allowAllWrite: true,
      allowAllSys: true,
      allowAllRun: true,
      allowAllNet: true,
      cwd: downloadDir,
    },
    {}
  );
  command.stderr.on("data", (data) => {
    console.warn(data);
    if (data.includes("Conversion failed!")) {
      toast.error("Conversion failed!");
    }
  });
  const api = rpcChannel.getAPI();
  return {
    api,
    rpcChannel,
    process,
    command,
  };
}

class WakeOnLan extends WorkerExtension {
  private hosts: WakeOnLanHost[] = [];
  private rpc?: {
    api: API;
    rpcChannel: RPCChannel<object, API>;
    process: Child;
    command: DenoCommand<string>;
  };

  onListItemSelected(name: string): Promise<void> {
    const host = this.hosts.find((host) => host.name === name);
    if (host) {
      console.log("host on list item selected", host);
      this.rpc?.api
        .wakeOnLan(host.mac, host.ip, host.port)
        .then(() => {
          toast.success("Host waked", {
            description: `Host ${host.name} waked`,
          });
        })
        .catch((err) => {
          toast.error("Failed to wake host", {
            description: err.message,
          });
        });
    }
    return Promise.resolve();
  }

  async onBeforeGoBack(): Promise<void> {
    this.rpc?.process.kill();
  }

  onActionSelected(value: string): Promise<void> {
    const action = JSON.parse(value);
    if (action.action === "delete") {
      const host = this.hosts.find((host) => host.name === action.name);
      if (host && host.id) {
        db.delete(host.id).then(() => {
          toast.success("Host deleted", {
            description: `Host ${action.name} deleted`,
          });
          this.hosts = this.hosts.filter((host) => host.id !== host.id);
        });
      } else {
        toast.error("Host not found", {
          description: `Host ${action.name} not found`,
        });
      }
    }
    return Promise.resolve();
  }

  async load() {
    this.rpc = await getRpcAPI();
    const hosts = await db.search({
      dataType: WakeOnLanHostType,
      fields: ["data", "search_text"],
    });
    for (const host of hosts) {
      if (!host.data) continue;
      try {
        const parsed = v.safeParse(WakeOnLanHost, JSON.parse(host.data));
        if (parsed.success) {
          this.hosts.push({ ...parsed.output, id: host.dataId });
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to parse wake on lan host", {
          description: host.data,
        });
      }
    }

    return ui.render(
      new List.List({
        items: this.hosts.map(
          (host) =>
            new List.Item({
              title: host.name,
              value: host.name,
              icon: new Icon({
                type: IconEnum.Iconify,
                value: "tabler:network",
                // hexColor: "#000000",
              }),
              subTitle: `${host.ip}:${host.port} [${host.mac}]`,
              actions: new Action.ActionPanel({
                items: [
                  new Action.Action({
                    title: "Delete",
                    value: JSON.stringify({
                      action: "delete",
                      name: host.name,
                    }),
                    icon: new Icon({
                      type: IconEnum.Iconify,
                      value: "tabler:trash",
                      hexColor: "#ff0000",
                    }),
                  }),
                ],
              }),
            })
        ),
      })
    );
  }
}

expose(new WakeOnLan());
