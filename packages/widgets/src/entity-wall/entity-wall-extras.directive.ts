import { Directive, inject, TemplateRef } from "@angular/core";
import { EntityWallPost } from "./entity-wall-post.model";

/** Marks projected extras template under a post body (media, audience, …). */
@Directive({
    selector: "ng-template[gcEntityWallExtras]",
    standalone: true,
})
export class EntityWallExtrasDirective {
    public readonly template = inject<TemplateRef<{ $implicit: EntityWallPost }>>(TemplateRef);
}
