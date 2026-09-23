import { InjectionToken } from "@angular/core";

/** Runtime env for shared BaseService / PlatformGamesService. */
export interface GcRuntimeEnvironment {
  apiUrl: string;
  assetsBaseUrl: string;
}

export const GC_ENVIRONMENT = new InjectionToken<GcRuntimeEnvironment>("GC_ENVIRONMENT");