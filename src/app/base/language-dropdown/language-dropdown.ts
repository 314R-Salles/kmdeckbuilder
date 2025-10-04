import {Component, inject} from '@angular/core';
import {Language} from "../../decklists/common/models/enums";
import {NgStyle} from "@angular/common";
import {StoreService} from "../../store.service";
import {toSignal} from "@angular/core/rxjs-interop";
import {AbstractDropdownComponent} from "../AbstractDropdownComponent";

@Component({
  selector: 'app-language-dropdown',
  imports: [
    NgStyle
  ],
  templateUrl: './language-dropdown.html',
  styleUrl: './language-dropdown.scss'
})
export class LanguageDropdown extends AbstractDropdownComponent {

  storeService = inject(StoreService)
  currentLanguage = toSignal(this.storeService.getLanguage())

  allLanguages = [
    Language.FR,
    Language.EN,
    Language.ES,
    Language.BR,
    Language.RU
  ]

  setLanguage(language) {
    this.storeService.setLanguage(language);
    this.storeService.setStorageLanguage(language);
  }

}
