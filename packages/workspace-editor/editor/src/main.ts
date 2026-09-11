import '@angular/localize/init';
import 'zone.js';
import 'virtual:game-global-styles';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig).catch((error) => console.error(error));
