import {Component, HostListener, inject} from '@angular/core';
import {Language} from "../../decklists/common/models/enums";
import {NgStyle} from "@angular/common";
import {StoreService} from "../../store.service";
import {toSignal} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-language-dropdown',
  imports: [
    NgStyle
  ],
  templateUrl: './language-dropdown.html',
  styleUrl: './language-dropdown.scss'
})
export class LanguageDropdown {

  storeService = inject(StoreService)
  currentLanguage = toSignal(this.storeService.getLanguage())

  allLanguages = [
    Language.FR,
    Language.EN,
    Language.ES,
    Language.BR,
    Language.RU
  ]

  displayDropdown = false

  setLanguage(language) {
    this.storeService.setLanguage(language);
    this.storeService.setStorageLanguage(language);
  }

  clickedInside

  dropdownClick() {
    this.displayDropdown = !this.displayDropdown
  }

  @HostListener('click', ['$event'])
  clickInside(event) {
    // event.stopPropagation();
    this.clickedInside = true
  }

  @HostListener('document:click')
  clickout() {
    if (!this.clickedInside) {
      this.displayDropdown = false;
    }
    this.clickedInside = false
  }
}
