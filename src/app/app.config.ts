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
