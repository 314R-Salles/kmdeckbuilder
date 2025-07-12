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
import {map, of, switchMap} from "rxjs";
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

  connectedUser = toSignal(this.storeService.getUser())
  connectedUserDecks = toSignal(
    toObservable<any>(this.connectedUser).pipe(
      switchMap((_) => {
        if (_) {
          const request = {
            users: [this.connectedUser().username],
            language: "FR",
            page: 0,
            pageSize: 20,
          };
          return this.authenticatedApiService.getDecks(request)
        } else {
          return of({content: []})
        }
      }),
      map(searchResults => {
        return searchResults.content;
      })
    ))

  favorites = toSignal(
    toObservable<any>(this.connectedUser).pipe(
      switchMap((_) => {
        if (_) {
          return this.authenticatedApiService.getRecentFavorites("FR")
        } else {
          return of({content: []})
        }
      }),
      map(searchResults => {
        return searchResults.content;
      })
    ))


  form = computed(() => new FormGroup({
    username: new FormControl(this.connectedUser()?.username, Validators.required),
    iconId: new FormControl(this.connectedUser()?.iconId)
  }));


  username = input.required<string>();


  routeUser = toSignal(
    toObservable<string>(this.username).pipe(
      switchMap((search) => {
        if (search) {
          return this.apiService.getUser(this.username())
        } else {
          return of(null)
        }
      }),
    ))

  routeUserdecks = toSignal(
    toObservable<any>(this.routeUser).pipe(
      switchMap((user) => {
        if (user) {
          const request = {
            users: [user.username],
            language: "FR",
            page: 0,
            pageSize: 20,
          };
          return this.apiService.getDecks(request)
        } else {
          return of({content: []})
        }
      }),
      map(searchResults => {
        return searchResults.content;
      })
    ))

  readOnly = computed(() => !this.connectedUser() || this.username() !== this.connectedUser().username);


  updateUser() {
    this.takenUsername = false
    this.authenticatedApiService.updateUser({
      username: this.form()!.get('username')?.value,
      iconId: this.form()!.get('iconId')?.value || 0,
    }).subscribe({
      next: user => {
        this.storeService.setUser(user)
        this.router.navigate(['/user', user.username])
      },
      error: err => this.takenUsername = true
    })

  }

  unlink() {
    this.authenticatedApiService.unlink().subscribe(user => this.storeService.setUser(user))
  }

}
