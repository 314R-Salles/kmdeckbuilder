import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection
} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';

import {routes} from './app.routes';
import {provideClientHydration, withEventReplay} from '@angular/platform-browser';
import {OAuthStorage, provideOAuthClient} from 'angular-oauth2-oidc';
import {provideHttpClient, withFetch} from '@angular/common/http';
import {AppInitializerService} from './app-initializer.service';
import {provideTranslateService} from "@ngx-translate/core";
import {provideTranslateHttpLoader} from "@ngx-translate/http-loader";

export const appConfig: ApplicationConfig = {
  providers: [
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideOAuthClient(),
    {provide: OAuthStorage, useFactory: storageFactory},
    provideAppInitializer(() => {
      const initializerFn = (initApp)(inject(AppInitializerService));
      return initializerFn();
    }),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/assets/public/i18n/',
        suffix: '.json'
      }),
      fallbackLang: 'en',
      lang: 'en'
    }),
  ]
};

export function initApp(appLoaderService: AppInitializerService) {
  return () => appLoaderService.initApp();
}

function storageFactory(): OAuthStorage {
  if (typeof window !== 'undefined') {
    return localStorage;
  }
  return null;
}
