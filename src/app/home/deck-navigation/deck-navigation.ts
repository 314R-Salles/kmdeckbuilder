import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
import {Section} from "../../base/section/section";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-deck-navigation',
    imports: [
        RouterLink,
        Section,
        TranslatePipe
    ],
  templateUrl: './deck-navigation.html',
  styleUrl: './deck-navigation.scss',
})
export class DeckNavigation {

}
