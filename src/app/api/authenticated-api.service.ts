import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {OAuthService} from "angular-oauth2-oidc";

@Injectable({
  providedIn: 'root'
})

export class AuthenticatedApiService {

  PRIVATE_BASE_API = environment.JAVA_API + '/authenticated';

  constructor(private http: HttpClient, private oauth: OAuthService) {
  }

  getCurrentUser(): Observable<any> {
    let headers = this.getAuthHeaders();
    return this.http.get<any>(this.PRIVATE_BASE_API + '/user', {headers});
  }

  updateUser(user: any): Observable<any> {
    let headers = this.getAuthHeaders();
    return this.http.post<any>(this.PRIVATE_BASE_API + '/user', user, {headers});
  }

  linkAccount(token: string): Observable<boolean> {
    let headers = this.getAuthHeaders();
    headers = headers.append('twitch', token);
    return this.http.get<boolean>(this.PRIVATE_BASE_API + '/user/twitch/linkAccount', {headers});
  }

  unlink(): Observable<any> {
    let headers = this.getAuthHeaders();
    return this.http.get<any>(this.PRIVATE_BASE_API + '/user/twitch/remove', {headers});
  }

  // return deck id and version
  saveDeck(form): Observable<any> {
    let headers = this.getAuthHeaders();
    // return this.http.post(this.PRIVATE_BASE_API + '/deck', form, {headers, responseType: "text"})
    return this.http.post(this.PRIVATE_BASE_API + '/deck', form, {headers})
  }

  addToFavorites(deckId: string): Observable<number> {
    let headers = this.getAuthHeaders();
    return this.http.get<number>(this.PRIVATE_BASE_API + '/user/favorite/add/' + deckId, {headers})
  }

  deleteDeck(deckId): Observable<any> {
    let headers = this.getAuthHeaders();
    return this.http.post<any>(this.PRIVATE_BASE_API + '/deck/' + deckId, null, {headers})
   }

  removeFromFavorites(deckId): Observable<number> {
    let headers = this.getAuthHeaders();
    return this.http.get<number>(this.PRIVATE_BASE_API + '/user/favorite/remove/' + deckId, {headers})
  }

  getRecentFavorites(language: string): Observable<any> {
    let headers = this.getAuthHeaders();
    return this.http.post<any>(this.PRIVATE_BASE_API + `/decks/recentFavorites/${language}`, null, {headers});
  }

  getDeck(params : {id: string, version: number, language: string}): Observable<any> {
    let headers = this.getAuthHeaders();
    return this.http.get<any>(this.PRIVATE_BASE_API + `/decks/${params.id}/language/${params.language}/version/${params.version}`, {headers});
  }

  private getAuthHeaders() {
    let headers = new HttpHeaders();
    return headers.append('Authorization', 'Bearer ' + this.oauth.getAccessToken())
  }

}

