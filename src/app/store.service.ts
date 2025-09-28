import {inject, Injectable} from '@angular/core';
import {Observable, ReplaySubject} from "rxjs";
import {ApiService} from "./api/api.service";
import {TranslateService} from "@ngx-translate/core";

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  apiService = inject(ApiService)
  translate = inject(TranslateService)

  news: any[]
  cardIllustrations = []
  cardNames = {
    FR: [], EN: [], ES: [], BR: [], RU: []
  }
  private readonly userSubject = new ReplaySubject(1);
  private readonly languageSubject: ReplaySubject<string> = new ReplaySubject(1);

  user = this.userSubject.asObservable();
  language: Observable<string> = this.languageSubject.asObservable();

  constructor() {
    this.userSubject.next(null) // valeur initiale sinon les guards fonctionnent pas.
  }

  setUser(user: any) {
    this.userSubject.next({...user})
  }

  getUser(): Observable<any> {
    return this.user
  }

  // en fait charger les tags ici de la meme façon? //FIXME
  setLanguage(language: string) {
    if (this.getCardNames(language).length === 0) {
      this.apiService.getCardNamesByLanguage(language).subscribe(cards => {
        this.setCardNames(this.getStorageLanguage(), cards)
        this.languageSubject.next(language)
        this.useLanguage(language)
      })
    } else {
      this.languageSubject.next(language)
      this.useLanguage(language)
    }
  }

  useLanguage(language) {
    this.translate.use(language.toLowerCase());
  }

  getLanguage() {
    return this.language
  }

  setStorageLanguage(language: string) {
    localStorage.setItem('language', language)
  }

  getStorageLanguage() {
    return localStorage.getItem('language')
  }

  setCardNames(language: string, cards: any[]) {
    this.cardNames[language] = cards;
  }

  getCardNames(language) {
    return this.cardNames[language];
  }

  getCardNamesAsMap(language) {
    return this.cardNames[language].reduce(function (map, obj) {
      map[obj.id] = obj.name;
      return map;
    }, {})
  }


  setNews(news: any[]) {
    this.news = news
  }

  getNews() {
    return this.news
  }

  setCardIllustrations(cardIllustrations: any[]) {
    this.cardIllustrations = cardIllustrations
  }

  getCardIllustrationsAsMap() {
    let result = this.cardIllustrations.reduce(function (map, obj) {
      map[obj.id] = obj.cardName;
      return map;
    }, {});
    result[-1] = '../cardback_basic.png'
    return result
  }
}
