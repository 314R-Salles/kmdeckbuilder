import {Component, OnInit} from '@angular/core';
import {StreamList} from '../stream-list/stream-list';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';


@Component({
  selector: 'app-home',
  imports: [
    StreamList,
    RouterLink,
    TranslatePipe
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog) {
  }


  ngOnInit() {
    // this.activatedRoute.queryParams.subscribe((params: any) => {
    //   if (params.verified) {
    //     const dialogRef = this.dialog.open(EmailVerifiedPopin, {
    //       width: '400px',
    //       height: '300px',
    //     });
    //     dialogRef.afterClosed().subscribe(_ =>
    //       this.router.navigateByUrl(this.router.url.substring(0, this.router.url.indexOf("?")))
    //     )
    //   }
    // })
  }


}
