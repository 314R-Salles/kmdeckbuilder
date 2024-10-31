import { Injectable } from '@angular/core';
import {AuthConfig, OAuthService} from "angular-oauth2-oidc";

export const authCodeFlowConfig: AuthConfig = {
  // URL of identity provider. https://<YOUR_DOMAIN>.auth0.com
  issuer: 'nope',
  redirectUri: 'http://localhost:4200', // doit etre environment host : krosma.ga
  clientId: 'nope',
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
    audience: 'http://localhost:8080',
  },

};

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private oauth: OAuthService) {
    // this.oauth.configure(authCodeFlowConfig);
    // this.oauth.loadDiscoveryDocumentAndTryLogin();
    // this.oauth.setupAutomaticSilentRefresh();
  }

  login(): void {
    this.oauth.initLoginFlow();
  }
}
