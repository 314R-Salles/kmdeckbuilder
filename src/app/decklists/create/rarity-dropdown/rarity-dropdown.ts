import {Component, HostListener, input, output} from '@angular/core';
import {JsonPipe, NgClass, NgStyle} from "@angular/common";

@Component({
  selector: 'app-rarity-dropdown',
  imports: [
    NgStyle,
    NgClass
  ],
  templateUrl: './rarity-dropdown.html',
  styleUrl: './rarity-dropdown.scss'
})
export class RarityDropdown {

  displayDropdown
  rarities = input<{ key: string, label: string, color: string, bgColor: string }[]>([]);
  selectedRarity = input<{ key: string, label: string, color: string, bgColor: string }>();
  onSelectRarity = output<{ key: string, label: string, color: string, bgColor: string }>();


  dropdownClick() {
    this.displayDropdown = !this.displayDropdown
  }

  selectRarity(cost) {
    this.onSelectRarity.emit(cost);
  }

  clickedInside

  @HostListener('click', ['$event'])
  clickInside(event) {
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
