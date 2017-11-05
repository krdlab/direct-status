import * as fs from "fs";

const DirectAPI = require("direct-js").DirectAPI;

export function create(role: string, accessToken: string): any {
  const storagePath = `/data/storage.local/${role}`;
  fs.existsSync(storagePath) || fs.mkdirSync(storagePath, 0o755);

  const d = DirectAPI.getInstance();
  d.setOptions({
    host: "api.direct4b.com",
    endpoint: "wss://api.direct4b.com/albero-app-server/api",
    access_token: accessToken,
    storage_path: storagePath
  });
  return d;
};