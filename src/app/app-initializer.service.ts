import {Inject, Injectable, PLATFORM_ID} from '@angular/core';
import {ApiService} from "./api/api.service";
import {StoreService} from "./store.service";
import {from, switchMap, tap} from "rxjs";
import {AuthenticatedApiService} from "./api/authenticated-api.service";
import {OAuthService} from "angular-oauth2-oidc";
import {isPlatformBrowser} from "@angular/common";
import {environment} from "../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AppInitializerService {

  constructor(private apiService: ApiService,
              private storeService: StoreService,
              private authenticatedApiService: AuthenticatedApiService,
              private oauthService: OAuthService,
              @Inject(PLATFORM_ID) private platformId: any) {
  }

  initApp() {
    if (isPlatformBrowser(this.platformId)) {
      let token = this.extractToken();
      if (token) {
        this.authenticatedApiService.linkAccount(token).subscribe(user => this.storeService.setUser(user))
      }

      // sert plus à rien ça
      this.apiService.getLatestNewsIds(3).subscribe(news =>
        this.storeService.setNews(news)
      )

      return this.apiService.getCardIllustrations().pipe(
        switchMap(cardList => {
          this.storeService.setCardIllustrations(cardList)
          this.oauthService.configure({
            issuer: 'https://login.krosmaga.tools/', // custom domain pour le tenant
            redirectUri: environment.REDIRECT_URI,
            clientId: 'ZqIWm3UfEuSjX0RaliUtVyaEzQ7iBc09',
            responseType: 'code',
            scope: 'openid profile admin',
            showDebugInformation: true,
            silentRefreshRedirectUri: window.location.origin,
            useSilentRefresh: true,
            customQueryParams: {
              /**
               * replace with your API-Audience
               * This is very important to retrieve a valid access_token for our API
               * */
              audience: environment.AUDIENCE,
            },

          });
          return from(this.oauthService.loadDiscoveryDocumentAndTryLogin())
        }),
        tap(_ => this.oauthService.setupAutomaticSilentRefresh()),
        tap(_ => {
          this.authenticatedApiService.getCurrentUser().subscribe(user => {
            this.storeService.setUser(user);
          })
        })
      )
    } else {
      return true
    }

    //?
    // if (token) {
    //   return forkJoin([
    //     this.authenticatedApiService.linkAccount(token),
    //     this.apiService.getLatestNewsIds(3)
    //   ]).pipe( tap(res => {
    //     this.storeService.setUser(res[0])
    //     this.storeService.setNews(res[1])
    //   }))
    // }
    //

    // sauvegarder à l'arrivée dans l'appli les X derniers ids de news, pour naviguer entre les news
    // utiliser un service pour stocker des données  et surtout avoir le initApp qui renvoie un observable à terminer avant que l'appli démarre.

  }

  clearHash() {
    location.hash = '';
  }

  extractToken(): string {
    const hash = window.location.hash;
    console.log(hash)
    const tokenAnchor = 'access_token=';
    if (hash && hash.indexOf(tokenAnchor) !== -1) {
      const index = hash.indexOf(tokenAnchor);
      this.clearHash();
      return hash.substr(index + tokenAnchor.length, 30);
    } else return ''
  }

}
