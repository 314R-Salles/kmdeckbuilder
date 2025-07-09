import {Component, Input, OnChanges} from '@angular/core';
import {ApiService} from "../../api/api.service";
import {StoreService} from "../../store.service";

@Component({
    selector: 'app-news-view',
    templateUrl: './news-view.component.html',
    styleUrl: './news-view.component.scss',
    standalone: false
})
export class NewsViewComponent implements OnChanges {

  // l'input id est fourni par la route o_o
  @Input() id: number
  news: any;
  loaded = false;
  next: any;
  previous: any;

  possibleNews: any[];

  constructor(private apiService: ApiService, private storeService: StoreService) {
  }

  // Il faut du OnChanges plutot que Init quand on navigue entre 2 news, on réutilise le meme composant, mais l'input change.
  ngOnChanges() {
    this.possibleNews = this.storeService.getNews() //.map(n => n.id)
    const possibleNewsIds = this.storeService.getNews().map(n => n.id)
    const index = possibleNewsIds.indexOf(+this.id)

    this.next = index === 0 ? null : this.possibleNews.find(n => n.id === possibleNewsIds[index - 1]);
    this.previous = index === 2 ? null : this.possibleNews.find(n => n.id === possibleNewsIds[index + 1]);


    //le getNews(id) pourrait etre dans le resolver du routing / pas de reel impact
    this.apiService.getNews(this.id).subscribe(news => {
      this.news = news;
      this.loaded = true
    })
  }


}
