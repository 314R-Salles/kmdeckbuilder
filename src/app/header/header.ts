import {Component, computed, inject, signal} from '@angular/core';
import {StoreService} from '../store.service';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {toSignal} from '@angular/core/rxjs-interop';
import {AuthService} from "../auth.service";
import {LanguageDropdown} from "../base/language-dropdown/language-dropdown";
import {TranslatePipe} from "@ngx-translate/core";

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

  menuOpen = signal(false);

  toggleMenu() {
    this.menuOpen.update(open => !open);
  }

  closeMenu() {
    this.menuOpen.set(false);
  }

}
