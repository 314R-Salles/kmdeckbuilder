import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {OAuthService} from "angular-oauth2-oidc";

@Injectable({
  providedIn: 'root'
})

export class AdminApiService {

  ADMIN_BASE_API = environment.JAVA_API + '/admin';

  constructor(private readonly http: HttpClient, private readonly oauth: OAuthService) {
  }

  getAllNewsIds(): Observable<any[]> {
    let headers = this.getAuthHeaders();
    return this.http.get<any[]>(this.ADMIN_BASE_API + `/news`, {headers});
  }

  deleteNews(id: number) {
    let headers = this.getAuthHeaders();
    return this.http.delete(this.ADMIN_BASE_API + `/news/${id}`, {headers});
  }

  update(content: string, id: number) {
    let headers = this.getAuthHeaders();
    return this.http.put(this.ADMIN_BASE_API + `/news/${id}`, content, {headers});
  }

  saveNews(content: any) {
    let headers = this.getAuthHeaders();
    return this.http.post(this.ADMIN_BASE_API + '/news', content, {headers});
  }


  disableNews(id: number): Observable<boolean> {
    let headers = this.getAuthHeaders();
    return this.http.post<boolean>(this.ADMIN_BASE_API + `/news/disable/${id}`, null, {headers});
  }


  saveIllustration(b64: string, title: string): Observable<number> {
    let headers = this.getAuthHeaders();
    return this.http.post<number>(this.ADMIN_BASE_API + `/illustrations`, {b64, title}, {headers});
  }

  // Theoriquement pas besoin de protéger, mais autant etre carré
  getIllustrationsTitles(): Observable<any[]> {
    let headers = this.getAuthHeaders();
    return this.http.get<any[]>(this.ADMIN_BASE_API + '/illustrations', {headers})
  }

  getIllustration(id: any): Observable<string> {
    let headers = this.getAuthHeaders();
    return this.http.get<string>(this.ADMIN_BASE_API + `/illustrations/${id}`, {
      headers,
      responseType: 'text' as 'json'
    });
  }


  getAllTags(): Observable<any> {
    let headers = this.getAuthHeaders();
    return this.http.get<any[]>(this.ADMIN_BASE_API + '/tags', {headers})
  }

  saveAllTags(tags): Observable<any> {
    let headers = this.getAuthHeaders();
    return this.http.post(this.ADMIN_BASE_API + '/tags', tags, {headers});
  }

  private getAuthHeaders() {
    let headers = new HttpHeaders();
    return headers.append('Authorization', 'Bearer ' + this.oauth.getAccessToken())
  }

}

