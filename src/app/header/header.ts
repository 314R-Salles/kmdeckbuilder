import {Component, computed, inject} from '@angular/core';
import {StoreService} from '../store.service';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {toSignal} from '@angular/core/rxjs-interop';
import {AuthService} from "../auth.service";

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

  authService = inject(AuthService);
  storeService = inject(StoreService);


  user = toSignal(this.storeService.getUser())
  isAdmin = computed(() => {
    return this.user()?.admin
  })

  login() {
    this.authService.login();
  }

}
