import {Injectable} from '@angular/core';
import {Observable, ReplaySubject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  news: any[]
  cardIllustrations: any[]
  private userSubject = new ReplaySubject(1);

  user = this.userSubject.asObservable();

  constructor() {
    this.userSubject.next(null) // valeur initiale sinon les guards fonctionnent pas.
  }

  setUser(user: any) {
    this.userSubject.next({...user})
  }

  getUser(): Observable<any> {
    return this.user
  }

  // marche pas
  // isAdmin(): Observable<any> {
  //   return this.getUser().pipe(
  //     map(e => {
  //       if (e?.admin) {
  //         return e.admin
  //       }
  //     }))
  // }


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
    let result = (this.cardIllustrations || []).reduce(function (map, obj) {
      map[obj.id] = obj.cardName;
      return map;
    }, {});
    result[-1] = '../cardback_basic.png'
    return result
  }
}
