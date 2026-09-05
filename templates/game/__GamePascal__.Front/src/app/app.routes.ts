import { Routes } from "@angular/router";
import { GAME_ROUTES } from "./__GameKebab__.routes";

export const routes: Routes = [
  { path: "", children: GAME_ROUTES },
];
