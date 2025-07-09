import {Component, OnInit} from '@angular/core';
import {AuthenticatedApiService} from "../../api/authenticated-api.service";
import {AdminApiService} from "../../api/admin-api.service";

@Component({
    selector: 'app-news-management',
    templateUrl: './news-management.component.html',
    styleUrl: './news-management.component.scss',
    standalone: false
})
export class NewsManagementComponent implements OnInit {

  allNews: any[] = []

  constructor(private adminApiService: AdminApiService) {
  }


  ngOnInit() {
    this.adminApiService.getAllNewsIds().subscribe(r => this.allNews = r.sort((a, b) => a.id < b.id ? 1 : -1))
  }

  disableNews(id: number) {
    this.adminApiService.disableNews(id).subscribe(newState => this.allNews.find(news => news.id === id).disabled = newState);
  }

  selectNews(id: number) {

  }

}
