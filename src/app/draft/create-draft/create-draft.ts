import {Component} from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";
import {MatCheckbox} from "@angular/material/checkbox";
import {Section} from "../../base/section/section";
import {TranslatePipe} from "@ngx-translate/core";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";
import {
    CdkDrag,
    CdkDragDrop,
    CdkDropList,
    CdkDropListGroup,
    moveItemInArray,
    transferArrayItem
} from "@angular/cdk/drag-drop";
import {ActionDropdown} from "../action-dropdown/action-dropdown";
import {MatExpansionPanel, MatExpansionPanelTitle} from "@angular/material/expansion";

@Component({
    selector: 'app-draft',
  imports: [
    ReactiveFormsModule,
    MatCheckbox,
    Section,
    TranslatePipe,
    MatIcon,
    MatTooltip,
    CdkDrag,
    CdkDropList,
    ActionDropdown,
    CdkDropListGroup
  ],
    templateUrl: './create-draft.html',
    styleUrl: './create-draft.scss'
})
export class CreateDraft {
    sharedPool = false
    groups = []
    wait = {type: 'wait', label: 'Wait'}

    setSharedPool(v) {
        this.sharedPool = v
    }

    setAction(action, groupIndex, actionIndex, playerIndex) {
        if (playerIndex === 1) {
            this.groups[groupIndex][actionIndex].actionJ1 = action
        }
        if (playerIndex === 2) {
            this.groups[groupIndex][actionIndex].actionJ2 = action
        }
    }

    drop(event: CdkDragDrop<string[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );

            for (let i = 0; i < this.groups.length; i++) {
                if (this.groups[i].length === 0) {
                    this.deleteGroup(i)
                }
            }
        }
    }


    addGroup() {
        this.groups.push([{actionJ1: this.wait, actionJ2: this.wait}])
    }

    deleteGroup(index) {
        this.groups.splice(index, 1)
    }


    addAction(groupIndex) {
        this.groups[groupIndex].push({actionJ1: this.wait, actionJ2: this.wait})
    }

    deleteAction(groupIndex, actionIndex) {
        this.groups[groupIndex].splice(actionIndex, 1)
    }


    constructor() {
        this.addGroup()
    }

    save() {

        for (let i = 0; i < this.groups.length; i++) {
            this.groups[i].forEach(a => a.groupId = i)
        }
        const flattened = this.groups.reduce((accumulator, value) => accumulator.concat(value), []);

        console.log(flattened)

      const request = {
          sharedPool: this.sharedPool,
          actions : flattened,
      }


    }


    resolver() {

      // si sharedPool
        const pool = [1, 2, 3, 4, 5, 6]

      // Sinon
      // const pool1 =
      // const pool2 =

        const actions = [
            {group: 1, order: 1, actionJ1: 'pick', actionJ2: 'pick', solved1: 'iop', solved2: 'xelor'},
            {group: 1, order: 2, actionJ1: 'pick', actionJ2: 'pick', solved1: 'sram', solved2: 'iop'},
            {group: 2, order: 3, actionJ1: 'ban', actionJ2: 'ban', solved1: 'iop', solved2: 'sram'},
            {group: 3, order: 4, actionJ1: 'pick', actionJ2: 'pick', solved1: null, solved2: null}
        ]

        // Find la "premiere action" qui vérifie : solved1 null et action1 pas wait ou ... pareil pour 2
        // Ca donne les actions effectuées

        // Coté java, on doit vérifier quel uuid fait la requete pour savoir : Si ses action afficher tout le temps, sinon conditionner à : autre joueur a fini le groupe aussi
        // pareil que pour la détection de l'action à effectuer, on check les null et on fait un booleen : tour terminé

        // Compter le nombre de "pick - ban" pour savoir combien de slots afficher dans le recap.
        // remplir les slots avec les résultats des actions
        // c'est mieux si tout ça est fait coté front pour "animer" le tout ?



    }



}
