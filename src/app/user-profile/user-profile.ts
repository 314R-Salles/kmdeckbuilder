import {Component, computed, effect, inject, input, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {environment} from '../../environments/environment';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {StoreService} from '../store.service';
import {ApiService} from '../api/api.service';
import {AuthenticatedApiService} from '../api/authenticated-api.service';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {DatePipe} from '@angular/common';
import {MatError} from '@angular/material/input';
import {Section} from '../base/section/section';
import {DeckPreview} from '../decklists/search/deck-preview/deck-preview';
import {combineLatest, debounceTime, filter, map, switchMap} from "rxjs";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";
import {TranslatePipe} from "@ngx-translate/core";

@Component({
  selector: 'app-user-profile',
  imports: [
    ReactiveFormsModule,
    MatError,
    DatePipe,
    Section,
    DeckPreview,
    TranslatePipe,
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile implements OnInit, OnDestroy {

  url = environment.TWITCH_AUTH_URL
  takenUsername = signal(false);

  router = inject(Router);
  storeService = inject(StoreService);
  apiService = inject(ApiService);
  authenticatedApiService = inject(AuthenticatedApiService);
  titleService = inject(Title);

  username = input.required<string>();
  readOnly = computed(() => !this.connectedUser() || this.username() !== this.connectedUser().username);
  connectedUser = toSignal(this.storeService.getUser())


  combinedObservable
    = combineLatest([toObservable<string>(this.username), this.storeService.getUser(), this.storeService.getLanguage()])
    .pipe(debounceTime(50))

  // signaux modifiables (plutôt que toSignal, en lecture seule) pour permettre à toggleFavorite
  // de mettre à jour liked/favoriteCount localement sans relancer un appel réseau complet
  connectedUserDecks = signal<any[]>([])
  favorites = signal<any[]>([])
  routeUserdecks = signal<any[]>([])

  subscriptions = []


  static readonly USERNAME_PATTERN = /^[a-zA-Z0-9]+$/;

  form = computed(() => new FormGroup({
    username: new FormControl(this.connectedUser()?.username,
      [Validators.required, Validators.pattern(UserProfile.USERNAME_PATTERN)]),
    iconId: new FormControl(this.connectedUser()?.iconId)
  }));


  routeUser = toSignal(
    this.combinedObservable.pipe(
      // filter(([username, _, __]) => !!username),
      switchMap(([username, _, __]) => {
        return this.apiService.getUser(this.username())
      })
    ))

  // Le titre de l'onglet dépend du pseudo chargé côté serveur, pas seulement du paramètre de route :
  // il doit donc se rafraîchir après un renommage, quand routeUser() reflète le nouveau pseudo.
  private titleUpdate = effect(() => {
    const user = this.routeUser();
    if (user) {
      this.titleService.setTitle(`${user.username} | Kmtools`);
    }
  });

  ngOnInit() {
    this.subscriptions.push(
      this.combinedObservable.pipe(
        filter(([_, user, __]) => !!user),
        switchMap(([_, user, language]) => {
          const request = {
            users: [user.username],
            language,
            searchBy: "RECENT",
            page: 0,
            pageSize: 20,
          };
          return this.apiService.getDecks(request)
        }),
        map(searchResults => searchResults.content)
      ).subscribe(decks => this.connectedUserDecks.set(decks))
    )

    this.subscriptions.push(
      this.combinedObservable.pipe(
        filter(([_, user, __]) => !!user),
        switchMap(([_, __, language]) => this.authenticatedApiService.getRecentFavorites(language)),
        map(searchResults => searchResults.content)
      ).subscribe(decks => this.favorites.set(decks))
    )

    this.subscriptions.push(
      this.combinedObservable.pipe(
        filter(([username, _, __]) => !!username),
        switchMap(([username, __, language]) => {
          const request = {
            users: [username],
            searchBy: "RECENT",
            language,
            page: 0,
            pageSize: 20,
          };
          return this.apiService.getDecks(request)
        }),
        map(searchResults => searchResults.content)
      ).subscribe(decks => this.routeUserdecks.set(decks))
    )
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  // update à la main du liked/count pour pas faire un refresh complet de la recherche, même logique que search-deck.ts
  toggleFavorite(deck: any, decksList: WritableSignal<any[]>) {
    if (!this.connectedUser() || deck.owned) {
      return;
    }
    const request$ = deck.liked
      ? this.authenticatedApiService.removeFromFavorites(deck.deckId)
      : this.authenticatedApiService.addToFavorites(deck.deckId);

    request$.subscribe(() => {
      decksList.update(values => {
        const toBeUpdated = values.find(d => d.deckId === deck.deckId);
        toBeUpdated.favoriteCount += toBeUpdated.liked ? -1 : 1;
        toBeUpdated.liked = !toBeUpdated.liked;
        return [...values];
      });
    })
  }

  updateUser() {
    if (this.form().invalid) {
      return
    }
    this.takenUsername.set(false)
    this.authenticatedApiService.updateUser({
      username: this.form().get('username')?.value,
      iconId: this.form().get('iconId')?.value ?? 0,
    }).subscribe({
      next: user => {
        this.storeService.setUser(user)
        this.router.navigate(['/user', user.username])
      },
      error: _ => this.takenUsername.set(true)
    })

  }

  unlink() {
    this.authenticatedApiService.unlink().subscribe(user => this.storeService.setUser(user))
  }

  sendEmail() {
    this.authenticatedApiService.sendValidationEmail().subscribe(user => this.storeService.setUser(user))
  }

  refreshMailStatus() {
    this.authenticatedApiService.refreshMailStatus().subscribe(user => this.storeService.setUser(user))
  }

}
