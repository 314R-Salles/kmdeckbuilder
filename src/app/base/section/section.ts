import {Component, inject, input, OnInit, signal} from '@angular/core';
import {StoreService} from '../../store.service';
import {NgClass} from '@angular/common';
import {AuthService} from "../../auth.service";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-section',
  imports: [
    NgClass,
    TranslatePipe
  ],
  templateUrl: './section.html',
  styleUrl: './section.scss'
})
export class Section implements OnInit {
  forceSize = input<boolean>(false);
  requiresLogin = input<boolean>(false);

  isLoggedIn = signal<boolean>(false)

  store = inject(StoreService);
  authService = inject(AuthService);

  ngOnInit() {
    this.store.getUser().subscribe(e => this.isLoggedIn.set(!!(e && e.lastLogin)))
  }

  login() {
    this.authService.login();
  }

}
