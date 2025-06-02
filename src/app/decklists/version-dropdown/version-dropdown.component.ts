import {Component, HostListener, Input} from '@angular/core';


@Component({
  selector: 'app-version-dropdown',
  templateUrl: './version-dropdown.component.html',
  styleUrl: './version-dropdown.component.scss'
})
export class VersionDropdownComponent {

  @Input() deckId: string
  @Input() allVersions: number[] = []
  @Input() currentVersion: number

  displayDropdown = false

  constructor() {
  }

  clickedInside

  dropdownOff() {
    this.displayDropdown = false;
  }

  dropdown() {
    this.displayDropdown = true;
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
