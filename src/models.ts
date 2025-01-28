import * as v from "valibot";

export const WakeOnLanHost = v.object({
  id: v.optional(v.number()),
  mac: v.string(),
  ip: v.string(),
  port: v.number(),
  name: v.string(),
});
export type WakeOnLanHost = v.InferOutput<typeof WakeOnLanHost>;

export const WakeOnLanHostType = "WakeOnLanHost";
