import {Component, computed, inject, input} from '@angular/core';
import {DeckDeletedPopin} from '../../../popins/deck-deleted-popin/deck-deleted-popin';
import {DeckDeletionPopin} from '../../../popins/deck-deletion-popin/deck-deletion-popin';
import {Section} from '../../../base/section/section';
import {RouterLink} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {AuthenticatedApiService} from '../../../api/authenticated-api.service';
import {VersionDropdown} from '../version-dropdown/version-dropdown';
import {ActivatedRoute, Router} from '@angular/router';
import {NgTemplateOutlet} from '@angular/common';
import {Synthesis} from '../../common/synthesis/synthesis';
import {ViewList} from '../view-list/view-list';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {ApiService} from '../../../api/api.service';
import {DomSanitizer} from '@angular/platform-browser';
import {StoreService} from '../../../store.service';
import {NgStyle} from '@angular/common';
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
    RaritySynthesis,
    NgStyle
  ],
  templateUrl: './view-deck.html',
  styleUrl: './view-deck.scss'
})
export class ViewDeck {

  displayDropdown = false

  id = input.required<string>()
  version = input.required<number>()

  apiService = inject(ApiService)
  authenticatedApiService = inject(AuthenticatedApiService)
  domSanitize = inject(DomSanitizer)
  storeService = inject(StoreService)
  dialog = inject(MatDialog);
  router = inject(Router);

  data = toSignal(
    toObservable<number>(this.version).pipe(
      filter(id => !!id),
      switchMap((id) => {
        return this.apiService.getDeck({id: this.id(), version: this.version(), language: 'FR'})
      }),
    ))

  d = this.data()
  title = computed(() => this.data()?.name);
  owner = computed(() => this.data()?.owner);
  versions = computed(() => this.data()?.versions);

  description = computed(() =>
    this.domSanitize.bypassSecurityTrustHtml(this.data()?.description.replaceAll("<p></p>", "<p><br></p>").replaceAll(/&nbsp;/g, ' ').replaceAll(/(?=\s)[^\r\n\t]/g, ' ')));

  user = toSignal(this.storeService.getUser())
  canEdit = computed(() => this.owner() === this.user()?.username);
  canClone = computed(() => this.user()?.username);

  syntheseRarete = computed(() => {
    let result = {[COMMUNE]: {[SORT]: 0, [CREA]: 0}, [PEU_COMMUNE]: {[SORT]: 0, [CREA]: 0}, [RARE]: {[SORT]: 0, [CREA]: 0}, [KROSMIQUE]: {[SORT]: 0, [CREA]: 0}, [INFINITE]: {[SORT]: 0, [CREA]: 0}};
    if (this.data() != null) {
      this.data().cards.forEach(card =>
        result[CardRarity[card.rarity]][CardType[card.cardType]] = result[CardRarity[card.rarity]][CardType[card.cardType]] + card.count)
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


toggleFavorite(deck) {
    if (this.canClone()) {
      if (!deck.liked) {
        this.authenticatedApiService.addToFavorites(deck.deckId).subscribe(r => {
          deck.favoriteCount += 1
          deck.liked = true
          // this.decks.find(deck => deck.deckId === deck.deckId).favoriteCount += 1
          // this.decks.find(deck => deck.deckId === deck.deckId).liked = true
        })
      } else {
        this.authenticatedApiService.removeFromFavorites(deck.deckId).subscribe(r => {
          deck.favoriteCount -= 1
          deck.liked = false
        })
      }
    }
  }

  deleteDeckConfirmation(deck) {
    const dialogRef = this.dialog.open(DeckDeletionPopin, {
            // width: '400px',
            // height: '250px',
            panelClass: 'endModalCss',
            data: {}
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result) {
              this.deleteDeck(deck)
              // this.router.navigate(['/decks/view', response.deckId, response.version])
            } else {
            }

          });

  }
  deleteDeck(deck) {
    this.authenticatedApiService.deleteDeck(deck.deckId).subscribe(r => {
      const dialogRef = this.dialog.open(DeckDeletedPopin, {
        // width: '400px',
        // height: '250px',
        panelClass: 'endModalCss',
        data: {}
      });
      dialogRef.afterClosed().subscribe(result => { this.router.navigate(['/home'])});
    });
  }
}
