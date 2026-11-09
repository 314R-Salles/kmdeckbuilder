import {inject, Injectable} from '@angular/core';
import {OAuthService} from "angular-oauth2-oidc";
import {environment} from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private oauth = inject(OAuthService);

  constructor() {
  }

  login(): void {
    this.oauth.initLoginFlow();
  }

  logout(): void {
    this.oauth.logOut(true); // true : on gère nous-mêmes la redirection, Auth0 n'expose pas d'end_session_endpoint OIDC standard
    const returnTo = encodeURIComponent(environment.SITE_URL);
    window.location.href = `${this.oauth.issuer}v2/logout?client_id=${this.oauth.clientId}&returnTo=${returnTo}`;
  }
}
