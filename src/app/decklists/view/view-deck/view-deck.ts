import {afterRenderEffect, Component, computed, ElementRef, inject, input, OnInit, PLATFORM_ID, Renderer2, signal, viewChild} from '@angular/core';
import {DeckDeletedPopin} from '../../../popins/deck-deleted-popin/deck-deleted-popin';
import {DeckDeletionPopin} from '../../../popins/deck-deletion-popin/deck-deletion-popin';
import {Section} from '../../../base/section/section';
import {Router, RouterLink} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {AuthenticatedApiService} from '../../../api/authenticated-api.service';
import {VersionDropdown} from '../version-dropdown/version-dropdown';
import {isPlatformBrowser, NgStyle, NgTemplateOutlet} from '@angular/common';
import {Synthesis} from '../../common/synthesis/synthesis';
import {ViewList} from '../view-list/view-list';
import {MatTooltip} from '@angular/material/tooltip';
import {MatIcon} from '@angular/material/icon';
import {ApiService} from '../../../api/api.service';
import {DomSanitizer, Meta, Title} from '@angular/platform-browser';
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
import {takeUntilDestroyed, toObservable, toSignal} from '@angular/core/rxjs-interop';
import {RaritySynthesis} from '../rarity-synthesis/rarity-synthesis';
import {GodCrest} from '../../search/god-crest/god-crest';
import {combineLatest, debounceTime, switchMap} from "rxjs";
import {environment} from "../../../../environments/environment";
import {isValidTwitchURL, isValidYouTubeURL} from "../../../base/models/utils";
import {YouTubePlayer} from "@angular/youtube-player";
import {TranslatePipe} from "@ngx-translate/core";
import {BreakpointObserver} from "@angular/cdk/layout";
import {map} from "rxjs";
import {DeckLinkDecoratorService} from './deck-link-decorator.service';

// même seuil que $mobile-breakpoint dans header.scss / MOBILE_BREAKPOINT dans pagination.ts
const MOBILE_BREAKPOINT = '(max-width: 768px)';
// ratio du player par défaut (640x390) conservé pour la version réduite
const MOBILE_YOUTUBE_PLAYER_WIDTH = 300;
const MOBILE_YOUTUBE_PLAYER_HEIGHT = 183;

@Component({
  selector: 'app-view-deck',
  imports: [
    Section,
    MatTooltip,
    RouterLink,
    VersionDropdown,
    NgTemplateOutlet,
    Synthesis,
    ViewList,
    MatIcon,
    RaritySynthesis,
    NgStyle,
    YouTubePlayer,
    TranslatePipe,
    GodCrest
  ],
  providers: [DeckLinkDecoratorService],
  templateUrl: './view-deck.html',
  styleUrl: './view-deck.scss'
})
export class ViewDeck implements OnInit {

  parent = environment.TWITCH_PARENT;


  displayDropdown = false

  id = input.required<string>()
  version = input.required<number>()
  minorVersion = input.required<number>()

  apiService = inject(ApiService)
  authenticatedApiService = inject(AuthenticatedApiService)
  domSanitize = inject(DomSanitizer)
  renderer = inject(Renderer2)
  storeService = inject(StoreService)
  dialog = inject(MatDialog);
  router = inject(Router);
  breakpointObserver = inject(BreakpointObserver);
  deckLinkDecorator = inject(DeckLinkDecoratorService);

  user = toSignal(this.storeService.getUser())

  isMobile = toSignal(
    this.breakpointObserver.observe(MOBILE_BREAKPOINT).pipe(map(state => state.matches)),
    {initialValue: this.breakpointObserver.isMatched(MOBILE_BREAKPOINT)}
  )

  platformId = inject(PLATFORM_ID);
  metaService = inject(Meta)
  titleService = inject(Title)

  combinedObservable
    = combineLatest([toObservable(this.version), this.storeService.getLanguage()])
    .pipe(debounceTime(50))


  data = signal<any>(null);

  descriptionContainer = viewChild<ElementRef<HTMLElement>>('descriptionContainer');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.combinedObservable.pipe(
        switchMap(([version, language]) => this.apiService.getDeck({id: this.id(), version, language})),
        takeUntilDestroyed(),
      ).subscribe(response => this.data.set(response));
    }

    afterRenderEffect(() => {
      this.description();
      const container = this.descriptionContainer()?.nativeElement;
      if (container) {
        this.deckLinkDecorator.decorate(container, this.renderer);
      }
    });
  }

  ngOnInit(): void {
    // Rendu côté serveur uniquement (SSR) : les bots de prévisualisation de liens (Discord, Twitter/X,
    // Facebook...) n'exécutent pas le JS, donc ces balises doivent être posées avant sérialisation du HTML,
    // via un appel léger dédié plutôt que le chargement complet du deck (cf ApiService.getDeckForCrawler,
    // déjà utilisé par DeckLinkDecoratorService — retourne {title, owner}).
    // Les `input.required` ne sont garantis disponibles qu'à partir de ngOnInit, pas du constructeur.
    if (isPlatformBrowser(this.platformId)) {
      return;
    }
    this.apiService.getDeckForCrawler({id: this.id(), version: this.version()}).subscribe(({title: deckTitle, owner: deckOwner}) => {
      const pageTitle = `${deckTitle} — par ${deckOwner} | Kmtools`;
      const pageDescription = `Deck "${deckTitle}" créé par ${deckOwner} sur Kmtools.`;
      this.titleService.setTitle(pageTitle);
      this.metaService.updateTag({name: 'description', content: pageDescription});
      this.metaService.updateTag({property: 'og:title', content: pageTitle});
      this.metaService.updateTag({property: 'og:description', content: pageDescription});
      this.metaService.updateTag({property: 'og:url', content: `${environment.SITE_URL}${this.router.url.split('?')[0]}`});
      this.metaService.updateTag({name: 'twitter:card', content: 'summary'});
    });
  }

  title = computed(() => this.data()?.name);
  owner = computed(() => this.data()?.owner);
  versions = computed(() => this.data()?.versions);

  description = computed(() =>
    this.domSanitize.bypassSecurityTrustHtml(this.data()?.description.replaceAll("<p></p>", "<p><br></p>").replaceAll(/&nbsp;/g, ' ').replaceAll(/(?=\s)[^\r\n\t]/g, ' ')));

  // Le contenu Quill vide est du HTML ("<p><br></p>", etc.) et non une chaîne vide : on retire les balises pour juger de la présence de texte.
  hasDescriptionContent = computed(() => !!this.data()?.description?.replace(/<[^>]*>/g, '').trim());

  displayTwitchIframe = computed(() => {
    const twitchCheck = isValidTwitchURL(this.data()?.videoLink)
    return twitchCheck.validId;
  })
  twitchIframeUrl = computed(() => {
    const twitchCheck = isValidTwitchURL(this.data()?.videoLink)
    return this.domSanitize.bypassSecurityTrustResourceUrl(`https://player.twitch.tv/?video=${twitchCheck.id}&parent=${this.parent}&autoplay=false`)
  })

  displayYoutubeIframe = computed(() => {
    const ytCheck = isValidYouTubeURL(this.data()?.videoLink)
    return ytCheck.validId;
  })
  youtubeVideoId = computed(() => {
    return isValidYouTubeURL(this.data()?.videoLink).id
  })
  youtubePlayerWidth = computed(() => this.isMobile() ? MOBILE_YOUTUBE_PLAYER_WIDTH : undefined)
  youtubePlayerHeight = computed(() => this.isMobile() ? MOBILE_YOUTUBE_PLAYER_HEIGHT : undefined)

  canEdit = computed(() => this.owner() === this.user()?.username);
  canClone = computed(() => this.user()?.username);

  syntheseRarete = computed(() => {
    let result = {
      [COMMUNE]: {[SORT]: 0, [CREA]: 0},
      [PEU_COMMUNE]: {[SORT]: 0, [CREA]: 0},
      [RARE]: {[SORT]: 0, [CREA]: 0},
      [KROSMIQUE]: {[SORT]: 0, [CREA]: 0},
      [INFINITE]: {[SORT]: 0, [CREA]: 0}
    };
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
    // peut like si connecté et pas propriétaire
    if (this.canClone() && !this.canEdit()) {
      if (!deck.liked) {
        this.authenticatedApiService.addToFavorites(deck.deckId).subscribe(r => {
          this.data.set({...deck, favoriteCount: deck.favoriteCount + 1, liked: true})
        })
      } else {
        this.authenticatedApiService.removeFromFavorites(deck.deckId).subscribe(r => {
          this.data.set({...deck, favoriteCount: deck.favoriteCount - 1, liked: false})
        })
      }
    }
  }

  deleteDeckConfirmation(deck) {
    const dialogRef = this.dialog.open(DeckDeletionPopin, {
      panelClass: 'endModalCss',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.deleteDeck(deck)
      }
    });

  }

  deleteDeck(deck) {
    this.authenticatedApiService.deleteDeck(deck.deckId).subscribe(r => {
      const dialogRef = this.dialog.open(DeckDeletedPopin, {
        panelClass: 'endModalCss',
        data: {}
      });
      dialogRef.afterClosed().subscribe(result => {
        this.router.navigate(['/home'])
      });
    });
  }
}
