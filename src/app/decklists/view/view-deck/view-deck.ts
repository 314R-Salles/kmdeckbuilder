import {Component, computed, inject, input} from '@angular/core';
import {Section} from '../../../base/section/section';
import {RouterLink} from '@angular/router';
import {VersionDropdown} from '../version-dropdown/version-dropdown';
import {NgTemplateOutlet} from '@angular/common';
import {Synthesis} from '../../common/synthesis/synthesis';
import {ViewList} from '../view-list/view-list';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {ApiService} from '../../../api/api.service';
import {DomSanitizer} from '@angular/platform-browser';
import {StoreService} from '../../../store.service';
import {
  CardRarity,
  CardType,
  COMMUNE,
  CREA,
  INFINITE,
  KROSMIQUE,
  PEU_COMMUNE,
  RARE,
  SORT
} from '../../common/models/enums';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {RaritySynthesis} from '../rarity-synthesis/rarity-synthesis';
import {filter, switchMap} from "rxjs";

@Component({
  selector: 'app-view-deck',
  imports: [
    Section,
    RouterLink,
    MatTooltip,
    VersionDropdown,
    NgTemplateOutlet,
    Synthesis,
    ViewList,
    MatIcon,
    RaritySynthesis
  ],
  templateUrl: './view-deck.html',
  styleUrl: './view-deck.scss'
})
export class ViewDeck {

  displayDropdown = false

  id = input.required<string>()
  version = input.required<number>()

  apiService = inject(ApiService)
  domSanitize = inject(DomSanitizer)
  storeService = inject(StoreService)

  data = toSignal(
    toObservable<number>(this.version).pipe(
      filter(id => !!id),
      switchMap((id) => {
        return this.apiService.getDeck({id: this.id(), version: this.version(), language: 'FR'})
      }),
    ))

  title = computed(() => this.data()?.name);
  owner = computed(() => this.data()?.owner);
  versions = computed(() => this.data()?.versions);

  description = computed(() =>
    this.domSanitize.bypassSecurityTrustHtml(this.data()?.description.replaceAll("<p></p>", "<p><br></p>").replaceAll(/&nbsp;/g, ' ')));

  user = toSignal(this.storeService.getUser())
  canEdit = computed(() => this.owner() === this.user()?.username);
  canClone = computed(() => this.user()?.username);

  syntheseRarete = computed(() => {
    let result = {[COMMUNE]: 0, [PEU_COMMUNE]: 0, [RARE]: 0, [KROSMIQUE]: 0, [INFINITE]: 0};
    if (this.data() != null) {
      this.data().cards.forEach(card =>
        result[CardRarity[card.rarity]] = result[CardRarity[card.rarity]] + card.count)
    }
    return result
  })

  syntheseCost = computed(() => {
    let result = {
      0: {[CREA]: 0, [SORT]: 0},
      1: {[CREA]: 0, [SORT]: 0},
      2: {[CREA]: 0, [SORT]: 0},
      3: {[CREA]: 0, [SORT]: 0},
      4: {[CREA]: 0, [SORT]: 0},
      5: {[CREA]: 0, [SORT]: 0},
      6: {[CREA]: 0, [SORT]: 0},
      7: {[CREA]: 0, [SORT]: 0}
    };
    if (this.data() != null) {
      this.data().cards.reduce((synthese, card) => {
        if (card.costAP >= 7) {
          synthese[7][CardType[card.cardType]] = synthese[7][CardType[card.cardType]] + card.count
        } else {
          synthese[card.costAP][CardType[card.cardType]] = synthese[card.costAP][CardType[card.cardType]] + card.count
        }
        return synthese;
      }, result)
    }
    return result
  })

  max = computed(() => Math.max(...Object.values(this.syntheseCost()).map(v => v[CREA] + v[SORT])))

}
