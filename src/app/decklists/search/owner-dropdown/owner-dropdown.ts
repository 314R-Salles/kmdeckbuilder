import {Component, computed, input, output} from '@angular/core';
import {NgStyle} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {TranslatePipe} from "@ngx-translate/core";
import {AbstractDropdownComponent} from "../../../base/AbstractDropdownComponent";

@Component({
  selector: 'app-owner-dropdown',
  imports: [
    NgStyle,
    FormsModule,
    TranslatePipe
  ],
  templateUrl: './owner-dropdown.html',
  styleUrl: './owner-dropdown.scss'
})
export class OwnerDropdown extends AbstractDropdownComponent {

  allUsers = input<{ username: string, count: number }[]>([]);
  selectedUsers = input<{ username: string, count: number }[]>([]);
  onSelectUser = output<any>();
  onNegativeSelectUser = output<any>();

  displayedUsers = computed(() => {
    let r = this.allUsers().filter(result => !this.selectedUsers().map(c => c.username).includes(result.username));
    return r.filter(user => !this.search() || user.username.toLowerCase().indexOf(this.search().toLowerCase()) != -1);
  })


  selectUser(user, negative) {
    if (!negative)
      this.onSelectUser.emit(user);
    else
      this.onNegativeSelectUser.emit(user);

    if (this.displayedUsers().length == 1) {
      this.search.set(null);
      this.displayDropdown = false
    }
  }

}
