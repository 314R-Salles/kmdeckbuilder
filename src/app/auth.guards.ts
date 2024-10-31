import {inject} from "@angular/core";
import {StoreService} from "./store.service";
import {map} from "rxjs";
import {Router} from "@angular/router";

export const AuthGuard = () => {
  const store = inject(StoreService);
  const router = inject(Router);
  return store.getUser().pipe(
    map(e => {
      if (e?.lastLogin) {
        return true
      } else {
        router.navigate(['/home']);
        return false;
      }
    }));
}

export const AdminGuard = () => {
  const store = inject(StoreService);
  const router = inject(Router);
  return store.getUser().pipe(
    map(e => {
      if (e?.admin) {
        return e.admin
      } else {
        router.navigate(['/home']);
        return false;
      }
    }));
}

