import { wakeOnLan } from "@hk/wol/deno";
const mac = "74:56:3C:30:D4:3A";
// console.log(mac.length);
wakeOnLan(mac, "10.6.6.255", 9);
// import { wake } from "@bukhalo/wol";

// wake("00:00:00:00:00:00");
