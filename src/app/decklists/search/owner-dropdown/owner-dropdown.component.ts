import {Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges} from '@angular/core';
import {ApiService} from "../../../api/api.service";

@Component({
  selector: 'app-owner-dropdown',
  templateUrl: './owner-dropdown.component.html',
  styleUrl: './owner-dropdown.component.scss'
})
export class OwnerDropdownComponent implements OnChanges{

  @Input()  allUsers: { username: string, count: number }[] = []
  displayedUsers: { username: string, count: number }[] = []
  @Input() selectedUsers = []
  @Output() onSelectUser = new EventEmitter<any>();
  userSearch

  displayDropdown = false

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.displayedUsers = this.allUsers
  }

  dropdownClick() {
    this.displayDropdown = !this.displayDropdown
    this.filterUsers()
  }


  filterUsers() {
    this.displayedUsers = this.allUsers.filter(result => !this.selectedUsers.map(c => c.username).includes(result.username));
    this.displayedUsers = this.displayedUsers.filter(user => !this.userSearch || user.username.toLowerCase().indexOf(this.userSearch.toLowerCase()) != -1);
  }

  selectUser(user) {
    // this.displayedUsers = this.displayedUsers.filter(u => u.username !== user.username);
    this.onSelectUser.emit(user);
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
      this.userSearch = null
      this.displayDropdown = false;
    }
    this.clickedInside = false
  }

}
