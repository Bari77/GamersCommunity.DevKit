import { Resource } from "@angular/core";

export class ResourceUtils {
    public static isPending(resource: Resource<unknown>): boolean {
        const status = resource.status();
        return status === "idle" || status === "loading";
    }
}
