import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {OAuthService} from "angular-oauth2-oidc";

@Injectable({
  providedIn: 'root'
})

// Mais en fait, la bonne pratique ça serait de pas avoir api et authApi services inclus dans le meme composant
// si j'ai besoin du auth, c'est que je suis sur une page admin/auth

// bon la bonne pratique ça serait surtout de split tout en services dédiés
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
    return this.http.get<boolean>(this.PRIVATE_BASE_API + '/twitch/linkAccount', {headers});
  }

  unlink(): Observable<boolean> {
    let headers = this.getAuthHeaders();
    return this.http.get<boolean>(this.PRIVATE_BASE_API + '/twitch/remove', {headers});
  }


  getAllNewsIds(): Observable<any[]> {
    let headers = this.getAuthHeaders();
    return this.http.get<any[]>(this.PRIVATE_BASE_API + `/news`, {headers});
  }

  deleteNews(id: number) {
    let headers = this.getAuthHeaders();
    return this.http.delete(this.PRIVATE_BASE_API + `/news/${id}`, {headers});
  }

  update(content: string, id: number) {
    let headers = this.getAuthHeaders();
    return this.http.put(this.PRIVATE_BASE_API + `/news/${id}`, content, {headers});
  }

  saveNews(content: any) {
    let headers = this.getAuthHeaders();
    return this.http.post(this.PRIVATE_BASE_API + '/news', content, {headers});
  }


  disableNews(id: number): Observable<boolean> {
    let headers = this.getAuthHeaders();
    return this.http.post<boolean>(this.PRIVATE_BASE_API + `/news/disable/${id}`, null, {headers});
  }


  saveIllustration(b64: string, title: string): Observable<number> {
    let headers = this.getAuthHeaders();
    return this.http.post<number>(this.PRIVATE_BASE_API + `/illustrations`, {b64, title}, {headers});
  }

  // Theoriquement pas besoin de protéger, mais autant etre carré
  getIllustrationsTitles(): Observable<any[]> {
    let headers = this.getAuthHeaders();
    return this.http.get<any[]>(this.PRIVATE_BASE_API + '/illustrations', {headers})
  }

  getIllustration(id: any): Observable<string> {
    let headers = this.getAuthHeaders();
    return this.http.get<string>(this.PRIVATE_BASE_API + `/illustrations/${id}`, {
      headers,
      responseType: 'text' as 'json'
    });
  }


  private getAuthHeaders() {
    let headers = new HttpHeaders();
    return headers.append('Authorization', 'Bearer ' + this.oauth.getAccessToken())
  }

}

