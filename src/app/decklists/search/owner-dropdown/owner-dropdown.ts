import {Component, computed, HostListener, input, output, signal} from '@angular/core';
import {NgStyle} from '@angular/common';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-owner-dropdown',
  imports: [
    NgStyle,
    FormsModule
  ],
  templateUrl: './owner-dropdown.html',
  styleUrl: './owner-dropdown.scss'
})
export class OwnerDropdown {

  displayDropdown = false

  allUsers = input<{ username: string, count: number }[]>([]);
  selectedUsers = input<{ username: string, count: number }[]>([]);
  onSelectUser = output<any>();
  onNegativeSelectUser = output<any>();
  userSearch = signal<string>('');

  displayedUsers = computed(() => {
    let r = this.allUsers().filter(result => !this.selectedUsers().map(c => c.username).includes(result.username));
    return r.filter(user => !this.userSearch() || user.username.toLowerCase().indexOf(this.userSearch().toLowerCase()) != -1);
  })


  constructor() {
  }

  dropdownClick() {
    this.displayDropdown = !this.displayDropdown
  }

  selectUser(user, negative) {
    this.displayDropdown = false // passer false ici, permet de garder le dropdown ouvert puisque dropdownClick se déclenche dans la foulée
    if (!negative)
      this.onSelectUser.emit(user);
    else
      this.onNegativeSelectUser.emit(user);

    if (this.displayedUsers().length == 1) {
              this.userSearch.set(null);
              this.displayDropdown = true
            }
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
      this.userSearch.set(null);
      this.displayDropdown = false;
    }
    this.clickedInside = false
  }

}
