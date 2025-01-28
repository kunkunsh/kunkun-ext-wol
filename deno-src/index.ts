import { expose } from "@kunkun/api/runtime/deno";
import { wakeOnLan } from "@hk/wol/deno";

expose({
  wakeOnLan: (mac: string, ip: string, port: number) => {
    wakeOnLan(mac, ip, port);
  },
});
