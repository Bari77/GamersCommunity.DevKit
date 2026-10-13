import { Directive, inject, TemplateRef } from "@angular/core";
import { LfgChatMessage } from "./lfg-chat-message.model";

/** Marks projected meta line under the sender; context `$implicit` is the message. */
@Directive({
    selector: "ng-template[gcLfgChatMeta]",
    standalone: true,
})
export class LfgChatMetaDirective {
    public readonly template = inject<TemplateRef<{ $implicit: LfgChatMessage }>>(TemplateRef);
}
