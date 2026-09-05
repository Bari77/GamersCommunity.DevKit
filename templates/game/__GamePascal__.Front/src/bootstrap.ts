import { bootstrapApplication } from "@angular/platform-browser";
import { bootstrapMocks, shouldUseMocks } from "@bari77/gc-playground";
import { appConfig } from "./app/app.config";
import { App } from "./app/app";
import { environment } from "./environments/environment";

async function main() {
  await bootstrapMocks(shouldUseMocks(environment), async () => {
    const { worker } = await import("./mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  });
  await bootstrapApplication(App, appConfig);
}

main().catch(console.error);
