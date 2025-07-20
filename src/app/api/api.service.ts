import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable} from "rxjs";
import {TwitchModel} from "../base/models/twitch.model";
import {YtVideo} from "../base/models/ytVideo";
import {OAuthService} from "angular-oauth2-oidc";

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  BASE_API = environment.JAVA_API + '/public';

  constructor(private http: HttpClient, private oauth: OAuthService) {
  }

  private getAuthHeaders() {
    let headers = new HttpHeaders();
    return headers.append('Authorization', 'Bearer ' + this.oauth.getAccessToken())
  }

  // user
  getUser(username: string): Observable<any> {
    return this.http.get<any>(this.BASE_API + `/user/${username}`);
  }

  // videos
  getStreams(): Observable<TwitchModel[]> {
    return this.http.get<TwitchModel[]>(this.BASE_API + '/twitch/streams');
  }

  getVods(): Observable<TwitchModel[]> {
    return this.http.get<TwitchModel[]>(this.BASE_API + '/twitch/vods');
  }

  checkVideo(videoId): Observable<{ type: string, invalidFormat: boolean }> {
    return this.http.get<any>(this.BASE_API + `/twitch/check/${videoId}`);
  }

  getLastVideos(): Observable<YtVideo[]> {
    return this.http.get<YtVideo[]>(this.BASE_API + '/youtube/videos');
  }

  //news
  getLastNews(howMany: number): Observable<any[]> {
    return this.http.get<any[]>(this.BASE_API + `/news/latest/${howMany}`);
  }

  getLatestNewsIds(howMany: number): Observable<any[]> {
    return this.http.get<any[]>(this.BASE_API + `/news/latestIds/${howMany}`);
  }

  getNews(id: number): Observable<any> {
    return this.http.get<any>(this.BASE_API + `/news/${id}`);
  }

  getCards(form: any): Observable<any> {
    return this.http.post<any>(this.BASE_API + `/cards`, form);
  }

  getCardsByName(form: any): Observable<any> {
    return this.http.post<any>(this.BASE_API + `/cards/byName`, form);
  }

  getCardIllustrations(): Observable<any> {
    return this.http.get<any>(this.BASE_API + `/cards/illustrations`);
  }

  getDecks(form: any): Observable<any> {
    if (this.oauth.hasValidAccessToken()) {
      let headers = this.getAuthHeaders();
      return this.http.post<any>(this.BASE_API + `/decks`, form, {headers})
    } else {
      return this.http.post<any>(this.BASE_API + `/decks`, form)
    }
  }

  getDeckOwners(): Observable<any> {
    return this.http.get<any>(this.BASE_API + `/decks/owners`);
  }

  getDeck(params: { id: string, version: number, language: string }): Observable<any> {
    return this.http.get<any>(this.BASE_API + `/decks/${params.id}/language/${params.language}/version/${params.version}`);
  }

  getTagsByLanguage(language): Observable<any> {
    return this.http.get<any>(this.BASE_API + `/tags/language/${language}`);
  }


}

