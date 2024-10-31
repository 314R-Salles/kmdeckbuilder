import {Component, OnInit} from '@angular/core';
import {ApiService} from "../api/api.service";
import {ActivatedRoute, Router} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {EmailVerifiedPopinComponent} from "../email-verified-popin/email-verified-popin.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {

  offset = 0
  news: any[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private apiService: ApiService) {
  }


  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params: any) => {
      if (params.verified) {
        const dialogRef = this.dialog.open(EmailVerifiedPopinComponent, {
          width: '400px',
          height: '300px',
        });
        // @ts-ignore
        dialogRef.afterClosed().subscribe(_ =>
          this.router.navigateByUrl(this.router.url.substring(0, this.router.url.indexOf("?")))
        )
      }
    })
    this.apiService.getLastNews(5).subscribe(news => this.news = news)
  }

}
