import {Component, input, output} from '@angular/core';
import {NgClass, NgStyle} from "@angular/common";
import {FormsModule} from "@angular/forms";
import {AbstractDropdownComponent} from "../../../base/AbstractDropdownComponent";

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
export class PaDropdown extends AbstractDropdownComponent {

  selectedCost = input<{ value: number, label: string }>();
  costs = input<{ value: number, label: string }[]>([]);
  onSelectCost = output<{ value: number, label: string }>();


  selectCost(cost) {
    this.onSelectCost.emit(cost);
  }

}
