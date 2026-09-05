import { Environment } from "@core/models/environment.model";

export const environment: Environment = {
  production: false,
  apiUrl: "http://localhost:__GatewayPort__/api",
  useMocks: false,
};
