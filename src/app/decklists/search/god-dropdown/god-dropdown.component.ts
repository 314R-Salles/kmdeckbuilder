import {Component, EventEmitter, HostListener, Input, Output} from '@angular/core';
import {GOD_ARRAY} from '../../models/enums';

@Component({
  selector: 'app-god-dropdown',
  templateUrl: './god-dropdown.component.html',
  styleUrl: './god-dropdown.component.scss'
})
export class GodDropdownComponent {

  allGods = GOD_ARRAY.filter(g=> g.name != 'NEUTRE')
  displayedGods = GOD_ARRAY.filter(g=> g.name != 'NEUTRE')
  @Input() selectedGods = []
  @Output() onSelectGod = new EventEmitter<any>();
  godSearch

  displayDropdown = false

  constructor() {
  }

  dropdownClick() {
    this.displayDropdown = !this.displayDropdown
    this.filterGods()
  }

  filterGods() {
    this.displayedGods = this.allGods.filter(result => !this.selectedGods.map(c => c.name).includes(result.name));
    this.displayedGods = this.displayedGods.filter(god => !this.godSearch || god.name.toLowerCase().indexOf(this.godSearch.toLowerCase()) != -1);
  }

  selectGod(god) {
    // this.displayedGods = this.displayedGods.filter(g => g.name !== god.name);
    this.onSelectGod.emit(god);
  }

  clickedInside

  @HostListener('click', ['$event'])
  clickInside(event) {
    // event.stopPropagation();
    this.clickedInside = true
  }

  @HostListener('document:click')
  clickout() {
    if (!this.clickedInside) {
      this.godSearch = null
      this.displayDropdown = false;
    }
    this.clickedInside = false
  }

}
