import {Injectable} from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Stream} from "../models/stream";
import {Vod} from "../models/vod";
import {YtVideo} from "../models/ytVideo";


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  BASE_API = environment.JAVA_API + '/public';

  constructor(private http: HttpClient) {
  }

  // user
  getUser(username: string): Observable<any> {
    return this.http.get<any>(this.BASE_API + `/user/${username}`);
  }

  // videos
  getStreams(): Observable<Stream[]> {
    return this.http.get<Stream[]>(this.BASE_API + '/twitch/streams');
  }

  getVods(): Observable<Vod[]> {
    return this.http.get<Vod[]>(this.BASE_API + '/twitch/vods');
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
    return this.http.post<any>(this.BASE_API + `/decks`, form);
  }

  getDeckOwners(): Observable<any> {
    return this.http.get<any>(this.BASE_API + `/decks/owners`);
  }

  getDeck(id, version, language): Observable<any> {
    return this.http.get<any>(this.BASE_API + `/decks/${id}/language/${language}/version/${version}`);
  }

  getTagsByLanguage(language): Observable<any> {
    return this.http.get<any>(this.BASE_API + `/tags/language/${language}`);
  }


}

