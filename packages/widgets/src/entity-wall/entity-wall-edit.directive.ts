import { Directive, inject, TemplateRef } from "@angular/core";
import { EntityWallPost } from "./entity-wall-post.model";

/** Marks projected edit-form template; context `$implicit` is the post being edited. */
@Directive({
    selector: "ng-template[gcEntityWallEdit]",
    standalone: true,
})
export class EntityWallEditDirective {
    public readonly template = inject<TemplateRef<{ $implicit: EntityWallPost }>>(TemplateRef);
}
