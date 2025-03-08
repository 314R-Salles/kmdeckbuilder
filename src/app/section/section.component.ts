import {Component, inject, Input, OnInit} from '@angular/core';
import {StoreService} from "../store.service";
import {AuthService} from "../auth.service";

@Component({
  selector: 'km-section',
  templateUrl: './section.component.html',
  styleUrl: './section.component.scss'
})
export class SectionComponent implements OnInit {
  @Input() title;
  @Input() titleSuffix;

  @Input() forceSize;

  @Input() backtrackPath;
  @Input() isLibrary;

  @Input() requiresLogin;
  isLoggedIn;

  store = inject(StoreService);
  authService = inject(AuthService);

  ngOnInit() {
    this.store.getUser().subscribe(e => this.isLoggedIn = e?.lastLogin)
  }

  login() {
    this.authService.login();
  }


}
