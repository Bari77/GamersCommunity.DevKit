import { EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from "@angular/core";
import { provideAnimations } from "@angular/platform-browser/animations";
import { NbEvaIconsModule } from "@nebular/eva-icons";
import {
    NbButtonModule,
    NbCardModule,
    NbContextMenuModule,
    NbFormFieldModule,
    NbIconModule,
    NbInputModule,
    NbLayoutModule,
    NbMenuModule,
    NbSpinnerModule,
    NbThemeModule,
    NbTooltipModule,
} from "@nebular/theme";

/**
 * Nebular UI for game remotes running standalone (playground).
 * Do NOT call this from federated routes — the shell already owns NbThemeModule.forRoot().
 */
export function providePlaygroundUi(themeName = "cosmic"): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideAnimations(),
        importProvidersFrom(
            NbThemeModule.forRoot({ name: themeName }),
            NbLayoutModule,
            NbMenuModule.forRoot(),
            NbContextMenuModule,
            NbTooltipModule,
            NbEvaIconsModule,
            NbCardModule,
            NbSpinnerModule,
            NbButtonModule,
            NbIconModule,
            NbFormFieldModule,
            NbInputModule,
        ),
    ]);
}
