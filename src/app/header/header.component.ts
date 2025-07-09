import {Component, OnInit} from '@angular/core';
import {AuthService} from "../auth.service";
import {StoreService} from "../store.service";
import {AuthenticatedApiService} from "../api/authenticated-api.service";

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss',
    standalone: false
})
export class HeaderComponent implements OnInit {
  user: any;
  isAdmin: any;

  constructor(private authService: AuthService,
              private authenticatedApiService: AuthenticatedApiService,
              private storeService: StoreService) {
  }

  ngOnInit() {
    this.storeService.getUser().subscribe(user => {
      this.user = user
      this.isAdmin = user?.admin
    })
  }

  login() {
    this.authService.login();
  }

}
