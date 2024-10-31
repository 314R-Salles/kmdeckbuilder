import {Injectable} from '@angular/core';
import {ApiService} from "./api/api.service";
import {StoreService} from "./store.service";
import {from, tap} from "rxjs";
import {AuthenticatedApiService} from "./api/authenticated-api.service";
import {authCodeFlowConfig, AuthService} from "./auth.service";
import {OAuthService} from "angular-oauth2-oidc";

@Injectable({
  providedIn: 'root'
})
export class AppInitializerService {

  constructor(private apiService: ApiService,
              private storeService: StoreService,
              private authenticatedApiService: AuthenticatedApiService,
              private oauthService: OAuthService) {
  }

  initApp() {
    // afterNextRender(() => {
    let token = this.extractToken();
    if (token) {
      this.authenticatedApiService.linkAccount(token).subscribe(user => this.storeService.setUser(user))
    }
    // });

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

    this.apiService.getLatestNewsIds(3).subscribe(news =>
      this.storeService.setNews(news)
    )
    this.oauthService.configure(authCodeFlowConfig);
    return from(this.oauthService.loadDiscoveryDocumentAndTryLogin()).pipe(
      tap(_ => this.oauthService.setupAutomaticSilentRefresh())
    );
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
