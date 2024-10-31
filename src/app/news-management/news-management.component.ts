import {Component, OnInit} from '@angular/core';
import {ApiService} from "../api/api.service";
import {AuthenticatedApiService} from "../api/authenticated-api.service";

@Component({
  selector: 'app-news-management',
  templateUrl: './news-management.component.html',
  styleUrl: './news-management.component.scss'
})
export class NewsManagementComponent implements OnInit {

  allNews: any[] = []

  constructor(private authenticatedApiService: AuthenticatedApiService) {
  }


  ngOnInit() {
    this.authenticatedApiService.getAllNewsIds().subscribe(r => this.allNews = r.sort((a, b) => a.id < b.id ? 1 : -1))
  }

  disableNews(id: number) {
    this.authenticatedApiService.disableNews(id).subscribe(newState => this.allNews.find(news => news.id === id).disabled = newState);
  }

  selectNews(id: number) {

  }

}
