import {Component, input, output} from '@angular/core';
import {NgClass, NgStyle} from "@angular/common";
import {AbstractDropdownComponent} from "../../../base/AbstractDropdownComponent";

@Component({
  selector: 'app-rarity-dropdown',
  imports: [
    NgStyle,
    NgClass
  ],
  templateUrl: './rarity-dropdown.html',
  styleUrl: './rarity-dropdown.scss'
})
export class RarityDropdown  extends AbstractDropdownComponent {

  rarities = input<{ key: string, label: string, color: string, bgColor: string }[]>([]);
  selectedRarity = input<{ key: string, label: string, color: string, bgColor: string }>();
  onSelectRarity = output<{ key: string, label: string, color: string, bgColor: string }>();

  selectRarity(cost) {
    this.onSelectRarity.emit(cost);
  }

}
