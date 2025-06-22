import {Component, inject, Input, OnChanges, SimpleChanges} from '@angular/core';
import {StoreService} from "../store.service";
import {ApiService} from "../api/api.service";
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {AuthenticatedApiService} from "../api/authenticated-api.service";
import {environment} from "../../environments/environment";

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnChanges{

  url = environment.TWITCH_AUTH_URL

  takenUsername: boolean;
  connectedUser: any;
  favorites = [];
  decks = [];

  readOnly;

  routeUsername
  routeUser
  form: FormGroup;

  store = inject(StoreService);

  // l'input est fourni par la route
  @Input() set username(value: string) {
    this.routeUsername = value
  }

  ngOnChanges(changes: SimpleChanges) {
    this.init()
  }

  constructor(private storeService: StoreService,
              private apiService: ApiService, private authenticatedApiService: AuthenticatedApiService) {
  }

  init() {
    this.form = new FormGroup({
      username: new FormControl('', Validators.required),
    });
    this.store.getUser().subscribe(user => {
      this.connectedUser = user;

      if(!this.routeUsername) {
        this.routeUsername = user.username
      }

      // Si on est pas connecté  OU si on est connecté et route != notre username
      // readonly et on affiche les decks
      if (!this.connectedUser || this.routeUsername != user.username) {
        this.readOnly = true
        this.apiService.getUser(this.routeUsername).subscribe(user => this.routeUser = user)

      } else {
        // Sinon : on regarde notre profil
        // mode edition et on affiche les decks+favoris
        this.readOnly = false
        this.form = new FormGroup({
          username: new FormControl(user.username, Validators.required),
          iconId: new FormControl(user.iconId)
        });
        this.authenticatedApiService.getRecentFavorites("FR").subscribe(
          favs => this.favorites = favs.content)
      }
      const request = {
        users: [this.routeUsername],
        language: "FR",
        page: 0,
        pageSize: 20,
      };
      let searchRequest;
      if (this.connectedUser) {
        searchRequest = this.authenticatedApiService.getDecks(request)
      } else {
        searchRequest = this.apiService.getDecks(request)
      }
      searchRequest.subscribe(r => this.decks = r.content)
    })
  }

  updateUser() {
    this.takenUsername = false
    this.authenticatedApiService.updateUser({
      username: this.form.get('username')?.value,
      iconId: this.form.get('iconId')?.value || 0,
    }).subscribe({
      next: user => this.storeService.setUser(user),
      error: err => this.takenUsername = true
    })

  }

  unlink() {
    this.authenticatedApiService.unlink().subscribe(user => this.storeService.setUser(user))
  }

  get username(): any {
    return this.form.get('username')?.value
  }

}
