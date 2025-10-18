import {Component, inject, input, OnInit, signal} from '@angular/core';
import {StoreService} from '../../store.service';
import {NgClass} from '@angular/common';
import {AuthService} from "../../auth.service";
import {TranslatePipe} from "@ngx-translate/core";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-section',
  imports: [
    NgClass,
    TranslatePipe,
    RouterLink
  ],
  templateUrl: './section.html',
  styleUrl: './section.scss'
})
export class Section implements OnInit {
  forceSize = input<boolean>(false);
  requiresLogin = input<boolean>(false);
  requiresVerified = input<boolean>(false);

  isLoggedIn = signal<boolean>(false)
  isVerified = signal<boolean>(false)

  username = signal<string>("")

  store = inject(StoreService);
  authService = inject(AuthService);

  ngOnInit() {
    this.store.getUser().subscribe(e => {
      this.isLoggedIn.set(!!(e && e.lastLogin))
      this.isVerified.set(!!(e && e.verified))
      this.username.set(e?.username || '')
    })
  }

  login() {
    this.authService.login();
  }

}
