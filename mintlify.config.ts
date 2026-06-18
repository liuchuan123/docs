import { defineConfig } from "@mintlify/config";

export default defineConfig({
  openapi: {
    merchant: {
      source: "/openapi.yaml",
      title: "PayMatrix Merchant API",
    },
  },
  api: {
    playground: {
      mode: "show",
    },
  },
});
