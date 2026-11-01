import {Component, computed, inject, signal} from '@angular/core';
import {StoreService} from '../store.service';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {toSignal} from '@angular/core/rxjs-interop';
import {AuthService} from "../auth.service";
import {LanguageDropdown} from "./language-dropdown/language-dropdown";
import {TranslatePipe} from "@ngx-translate/core";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
    LanguageDropdown,
    TranslatePipe,
    MatIcon,
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

  logout() {
    this.closeMenu();
    this.storeService.clearUser();
    this.authService.logout();
  }

  menuOpen = signal(false);

  toggleMenu() {
    this.menuOpen.update(open => !open);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

}
