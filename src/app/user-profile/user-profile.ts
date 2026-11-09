import {Component, computed, effect, inject, input, OnDestroy, OnInit, signal, WritableSignal} from '@angular/core';
import {environment} from '../../environments/environment';
import {AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors} from '@angular/forms';
import {StoreService} from '../store.service';
import {ApiService} from '../api/api.service';
import {AuthenticatedApiService} from '../api/authenticated-api.service';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {DatePipe} from '@angular/common';
import {MatError} from '@angular/material/input';
import {Section} from '../common/components/section/section';
import {DeckPreview} from '../decklists/search/deck-preview/deck-preview';
import {combineLatest, debounceTime, filter, map, switchMap} from "rxjs";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";
import {TranslatePipe} from "@ngx-translate/core";
import {MatTooltip} from '@angular/material/tooltip';

@Component({
  selector: 'app-user-profile',
  imports: [
    ReactiveFormsModule,
    MatError,
    DatePipe,
    Section,
    DeckPreview,
    TranslatePipe,
    MatTooltip,
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

  // même logique que DeckPreview : seule la langue FR a une locale de date dédiée, les autres restent en EN
  private currentLanguage = toSignal(this.storeService.getLanguage());
  dateLocale = computed(() => this.currentLanguage() === 'FR' ? 'fr' : 'en-US');

  username = input.required<string>();
  readOnly = computed(() => !this.connectedUser() || this.username() !== this.connectedUser().username);
  connectedUser = toSignal(this.storeService.getUser())

  private static readonly PASSWORD_REQUEST_COOLDOWN_MS = 60 * 60 * 1000;
  passwordCooldownActive = signal(false);

  // Un setTimeout unique plutôt qu'un interval qui poll en continu : il n'y a qu'un seul instant qui nous
  // intéresse (la fin du cooldown), pas besoin de vérifier l'état à intervalle régulier pour l'atteindre.
  private passwordCooldownTimer = effect(onCleanup => {
    const passwordChange = this.connectedUser()?.passwordChange;
    if (!passwordChange) {
      this.passwordCooldownActive.set(false);
      return;
    }
    const remainingMs = new Date(passwordChange).getTime() + UserProfile.PASSWORD_REQUEST_COOLDOWN_MS - Date.now();
    if (remainingMs <= 0) {
      this.passwordCooldownActive.set(false);
      return;
    }
    this.passwordCooldownActive.set(true);
    const timerId = setTimeout(() => this.passwordCooldownActive.set(false), remainingMs);
    onCleanup(() => clearTimeout(timerId));
  });


  combinedObservable
    = combineLatest([toObservable<string>(this.username), this.storeService.getUser(), this.storeService.getLanguage()])
    .pipe(debounceTime(50))

  // signaux modifiables (plutôt que toSignal, en lecture seule) pour permettre à toggleFavorite
  // de mettre à jour liked/favoriteCount localement sans relancer un appel réseau complet
  connectedUserDecks = signal<any[]>([])
  favorites = signal<any[]>([])
  routeUserdecks = signal<any[]>([])

  subscriptions = []


  // Le pseudo est injecté tel quel dans le chemin de l'URL (voir ApiService.getUser) : seuls les caractères qui
  // changeraient la structure d'une URL sont interdits (délimiteurs génériques de la RFC 3986, "\" que les
  // navigateurs normalisent en "/", et "%" qui déclenche le décodage pourcentage). Le reste, espaces internes
  // compris, est toléré.
  static readonly USERNAME_PATTERN = /^[^:/?#\[\]@\\%]+$/;

  private static isBlankAfterTrim(value: string): boolean {
    return value.trim().length === 0;
  }

  // Un seul point de vérité pour "qu'est-ce qu'un pseudo valide" : évite d'avoir Validators.required et
  // Validators.pattern qui statuent chacun sur une version différente de la valeur (brute vs. trim).
  static usernameValidator(control: AbstractControl<string>): ValidationErrors | null {
    const value = control.value ?? '';
    if (UserProfile.isBlankAfterTrim(value)) {
      return {required: true};
    }
    return UserProfile.USERNAME_PATTERN.test(value) ? null : {pattern: true};
  }

  form = computed(() => new FormGroup({
    username: new FormControl(this.connectedUser()?.username, UserProfile.usernameValidator),
    iconId: new FormControl(this.connectedUser()?.iconId)
  }));


  routeUser = toSignal(
    this.combinedObservable.pipe(
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
      // Trim explicite plutôt que de compter sur le fait qu'une URL supprime silencieusement les espaces
      // en début/fin de chaîne : ce comportement ne s'applique que si le pseudo est le tout dernier segment
      // de l'URL, il ne faut pas en dépendre.
      username: this.form().get('username')?.value.trim(),
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

  requestPasswordChange() {
    this.authenticatedApiService.requestPasswordChange().subscribe(user => this.storeService.setUser(user))
  }

}
