import {Directive, HostListener, signal} from "@angular/core";


@Directive()
export abstract class AbstractDropdownComponent {

  displayDropdown
  clickedInside

  search = signal<string>('');

  dropdownClick() {
    this.displayDropdown = !this.displayDropdown
  }

  @HostListener('click', ['$event'])
  clickInside(event) {
    this.clickedInside = true
  }

  @HostListener('document:click')
  clickout() {
    if (!this.clickedInside) {
      this.displayDropdown = false;
      this.search.set('');
    }
    this.clickedInside = false
  }
}
