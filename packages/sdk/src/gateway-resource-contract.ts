export interface GatewayResourceContract {
    type: "DATA" | "APP" | "INFRA";
    name: string;
    actions?: string[];
}
