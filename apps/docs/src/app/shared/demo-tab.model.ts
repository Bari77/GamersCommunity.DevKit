import { CodeLanguage } from "./code-block.component";

export interface DemoTab {
    id: string;
    label: string;
    language: CodeLanguage;
    code: string;
}
