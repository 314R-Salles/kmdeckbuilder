import {Component, HostListener, input} from '@angular/core';
import {NgStyle} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-version-dropdown',
  imports: [
    NgStyle,
    RouterLink,
    MatIcon
  ],
  templateUrl: './version-dropdown.html',
  styleUrl: './version-dropdown.scss'
})
export class VersionDropdown {

  deckId = input.required<string>()
  allVersions = input.required<number[]>()
  currentVersion = input.required<number>()

  displayDropdown = false

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
