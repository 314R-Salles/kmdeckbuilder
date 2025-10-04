import {Component, input} from '@angular/core';
import {NgStyle} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {AbstractDropdownComponent} from "../../../base/AbstractDropdownComponent";

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
export class VersionDropdown  extends AbstractDropdownComponent {

  deckId = input.required<string>()
  allVersions = input.required<string[]>()
  currentVersion = input.required<number>()
  minorVersion = input.required<number>()

}
