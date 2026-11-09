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

  clearUser() {
    this.userSubject.next(null)
  }

  getUser(): Observable<any> {
    return this.user
  }

  private static readonly DEFAULT_LANGUAGE = 'FR';

  // en fait charger les tags ici de la meme façon? //FIXME
  setLanguage(language: string) {
    this.persistLanguage(language)
    if (this.getCardNames(language).length === 0) {
      this.apiService.getCardNamesByLanguage(language).subscribe(cards => {
        this.setCardNames(language, cards)
        this.languageSubject.next(language)
        this.useLanguage(language)
      })
    } else {
      this.languageSubject.next(language)
      this.useLanguage(language)
    }
  }

  // A appeler une seule fois au démarrage : reprend la langue persistée, ou la langue par défaut.
  initLanguage() {
    this.setLanguage(this.getStorageLanguage() ?? StoreService.DEFAULT_LANGUAGE)
  }

  private useLanguage(language) {
    this.translate.use(language.toLowerCase());
  }

  getLanguage() {
    return this.language
  }

  private persistLanguage(language: string) {
    localStorage.setItem('language', language)
  }

  private getStorageLanguage(): string | null {
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
      map[obj.id] = obj.cardName + '.webp';
      return map;
    }, {});
    result[-1] = '../cardback_basic.webp'
    return result
  }
}
