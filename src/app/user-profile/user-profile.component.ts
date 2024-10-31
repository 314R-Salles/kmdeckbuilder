import {Component, Input} from '@angular/core';
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
export class UserProfileComponent {

  url = environment.TWITCH_AUTH_URL

  user: any;

  form: FormGroup;

  // l'input est fourni par la route
  @Input() set username(value: string) {
    if (!value) {
      // si pas de /username alors user connecté.
      this.storeService.getUser().subscribe(user => {
        this.user = user;
        this.form = new FormGroup({
          username: new FormControl(user.username, Validators.required),
          iconId: new FormControl(user.iconId)
        });
      });
    } else {
      this.apiService.getUser(value).subscribe(user => this.user = user)
    }
  }

  constructor(private storeService: StoreService,
              private apiService: ApiService, private authenticatedApiService: AuthenticatedApiService) {
  }


  updateUser() {
    this.authenticatedApiService.updateUser({
      username: this.form.get('username')?.value,
      iconId: this.form.get('iconId')?.value || 0,
    }).subscribe(user => this.storeService.setUser(user))
  }

  unlink() {
    this.authenticatedApiService.unlink().subscribe(user => this.storeService.setUser(user))
  }

  get username(): any {
    return this.form.get('username')?.value
  }


}
