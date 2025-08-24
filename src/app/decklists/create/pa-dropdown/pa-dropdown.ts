import {Component, HostListener, input, output} from '@angular/core';
import {NgClass, NgStyle} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-pa-dropdown',
  imports: [
    NgClass,
    NgStyle,
    FormsModule
  ],
  templateUrl: './pa-dropdown.html',
  styleUrl: './pa-dropdown.scss'
})
export class PaDropdown {

  displayDropdown
  selectedCost = input<{ value: number, label: string }>();
  costs = input<{ value: number, label: string }[]>([]);
  onSelectCost = output<{ value: number, label: string }>();


  dropdownClick() {
    this.displayDropdown = !this.displayDropdown
  }

  selectCost(cost) {
    this.onSelectCost.emit(cost);
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
