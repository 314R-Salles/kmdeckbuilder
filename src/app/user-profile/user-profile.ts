import {Component, computed, inject, input} from '@angular/core';
import {environment} from '../../environments/environment';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {StoreService} from '../store.service';
import {ApiService} from '../api/api.service';
import {AuthenticatedApiService} from '../api/authenticated-api.service';
import {Router, RouterLink} from '@angular/router';
import {DatePipe, NgClass} from '@angular/common';
import {MatError} from '@angular/material/input';
import {Section} from '../base/section/section';
import {combineLatest, debounceTime, filter, map, switchMap} from "rxjs";
import {toObservable, toSignal} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-user-profile',
  imports: [
    RouterLink,
    NgClass,
    ReactiveFormsModule,
    MatError,
    DatePipe,
    Section
  ],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile {

  url = environment.TWITCH_AUTH_URL
  takenUsername: boolean = false;

  router = inject(Router);
  storeService = inject(StoreService);
  apiService = inject(ApiService);
  authenticatedApiService = inject(AuthenticatedApiService);

  username = input.required<string>();
  readOnly = computed(() => !this.connectedUser() || this.username() !== this.connectedUser().username);
  connectedUser = toSignal(this.storeService.getUser())


  combinedObservable
    = combineLatest([toObservable<string>(this.username), this.storeService.getUser(), this.storeService.getLanguage()])
    .pipe(debounceTime(50))

  connectedUserDecks = toSignal(
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
      map(searchResults => {
        return searchResults.content;
      })
    ))

  favorites = toSignal(
    this.combinedObservable.pipe(
      filter(([_, user, __]) => !!user),
      switchMap(([_, __, language]) => {
        return this.authenticatedApiService.getRecentFavorites(language)
      }),
      map(searchResults => {
        return searchResults.content;
      })
    ))


  form = computed(() => new FormGroup({
    username: new FormControl(this.connectedUser()?.username, Validators.required),
    iconId: new FormControl(this.connectedUser()?.iconId)
  }));


  routeUser = toSignal(
    this.combinedObservable.pipe(
      // filter(([username, _, __]) => !!username),
      switchMap(([username, _, __]) => {
        return this.apiService.getUser(this.username())
      })
    ))

  routeUserdecks = toSignal(
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
      map(searchResults => {
        return searchResults.content;
      })
    ))


  updateUser() {
    this.takenUsername = false
    this.authenticatedApiService.updateUser({
      username: this.form().get('username')?.value,
      iconId: this.form().get('iconId')?.value || 0,
    }).subscribe({
      next: user => {
        this.storeService.setUser(user)
        this.router.navigate(['/user', user.username])
      },
      error: _ => this.takenUsername = true
    })

  }

  unlink() {
    this.authenticatedApiService.unlink().subscribe(user => this.storeService.setUser(user))
  }

}
