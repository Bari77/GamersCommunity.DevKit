import { ValidationSeverity } from "./types.js";
export interface ValidationIssue {
    path: string;
    message: string;
    severity: ValidationSeverity;
}
