import {Component, inject, input, OnInit, signal} from '@angular/core';
import {StoreService} from '../../store.service';
import {RouterLink} from '@angular/router';
import {NgClass} from '@angular/common';
import {AuthService} from "../../auth.service";

@Component({
  selector: 'app-section',
  imports: [
    NgClass
  ],
  templateUrl: './section.html',
  styleUrl: './section.scss'
})
export class Section implements OnInit {
  title = input<string>();
  titleSuffix = input<string>();
  forceSize = input<boolean>(false);
  backtrackPath = input<string>();
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
