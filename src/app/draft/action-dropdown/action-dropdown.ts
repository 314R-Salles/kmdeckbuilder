import {Component, computed, input, output} from '@angular/core';
import {NgClass, NgStyle} from "@angular/common";
import {AbstractDropdownComponent} from "../../base/AbstractDropdownComponent";

@Component({
  selector: 'app-action-dropdown',
  imports: [
    NgStyle,
  ],
  templateUrl: './action-dropdown.html',
  styleUrl: './action-dropdown.scss'
})
export class ActionDropdown extends AbstractDropdownComponent {

  pick = {type: 'pick', label: 'Pick'}
  wait = {type: 'wait', label: 'Wait'}
  banPool = {type: 'banPool', label: 'Ban du pool de dieux'}
  banAdverse = {type: 'banSelected', label: 'Ban dans la sélection adverse'}


  choices = [this.wait, this.pick, this.banPool, this.banAdverse]
  selectedAction = input<{ type: string, label: string }>();
  onSelectAction = output<{ type: string, label: string }>();

  cardNames = computed(() => console.log(this.selectedAction()))


  selectAction(action) {
    this.onSelectAction.emit(action);
  }

}
