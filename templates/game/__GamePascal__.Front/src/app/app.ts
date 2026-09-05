import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { NbLayoutModule } from "@nebular/theme";
import { environment } from "../environments/environment";

@Component({
  selector: "__CssPrefix__-root",
  standalone: true,
  imports: [RouterOutlet, NbLayoutModule],
  template: `
    <nb-layout>
      @if (showBanner) {
        <nb-layout-header fixed>
          <span>__GamePascal__ Playground</span>
        </nb-layout-header>
      }
      <nb-layout-column>
        <router-outlet />
      </nb-layout-column>
    </nb-layout>
  `,
})
export class App {
  protected readonly showBanner = environment.useMocks === true;
}
