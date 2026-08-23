import { defineConfig, devices } from "@playwright/test";
import base from "./playwright.config";

// webkit で複数ワーカー実行時に落ちてしまいテストが不合格となるため別設定にする
export default defineConfig({
  ...base,
  projects: [
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        actionTimeout: 30000,
        navigationTimeout: 60000,
      },
    },
  ],
});
