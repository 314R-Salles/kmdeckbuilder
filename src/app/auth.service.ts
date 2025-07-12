import {inject, Injectable} from '@angular/core';
import {OAuthService} from "angular-oauth2-oidc";

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
}
