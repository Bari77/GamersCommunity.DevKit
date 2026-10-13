import { Directive, inject, TemplateRef } from "@angular/core";
import { LfgChatMessage } from "./lfg-chat-message.model";

/** Marks projected leading visual template; context `$implicit` is the message. */
@Directive({
    selector: "ng-template[gcLfgChatLeading]",
    standalone: true,
})
export class LfgChatLeadingDirective {
    public readonly template = inject<TemplateRef<{ $implicit: LfgChatMessage }>>(TemplateRef);
}
