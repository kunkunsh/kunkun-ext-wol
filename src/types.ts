export interface API {
  wakeOnLan: (mac: string, ip: string, port?: number) => Promise<void>;
}
