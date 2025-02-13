import { expose } from "@kunkun/api/runtime/deno";
import { wakeOnLan } from "@hk/wol/deno";
import type { API } from "../src/types.ts";

expose({
  wakeOnLan: (mac: string, ip: string, port?: number) => {
    return wakeOnLan(mac, ip, port);
  },
} satisfies API);
