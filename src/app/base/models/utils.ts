import {AbstractControl, AsyncValidatorFn, ValidationErrors} from "@angular/forms";
import {ApiService} from "../../api/api.service";
import {delay, map, Observable, of, switchMap} from "rxjs";

export const customSort = (cardA, cardB) => {
  if (cardA.costAP != cardB.costAP) return cardA.costAP - cardB.costAP
  else return cardA.name.localeCompare(cardB.name)
}


export class VideoValidator {
  static createValidator(apiService: ApiService, data: any): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors> => {
      if (control.value === '' || control.value === null) {
        return of(null);
      }
      return of(control.value).pipe(
        delay(200),
        switchMap(controlValue => {
          const ytCheck = isValidYouTubeURL(controlValue)
          if (ytCheck.type === 'youtube' || ytCheck.invalidUrl) {
            // si on détecte une vidéo youtube, on passe à la suite pour analyse
            return of(ytCheck)
          } else {
            // si twitch ou inconnu
            const twitchCheck = isValidTwitchURL(controlValue)
            if (twitchCheck.type === 'twitch' && twitchCheck.validId) {
              // si on détecte une vidéo twitch, on doit compléter avec un appel d'api pour vérifier le type de la vidéo
              return apiService.checkVideo(twitchCheck.id)
            }
            return of(twitchCheck);
          }
        }),
        map((videoCheck: any) => {
          if (['youtube', 'twitch'].includes(videoCheck.type)) {
            data.type = videoCheck.type;
            if (!videoCheck.validId) {
              return {invalidLinkError: true};
            } else if (videoCheck.invalidFormat) {
              return {invalidFormatError: true};
            } else {
              return null;
            }
          } else {
            return {unknownHostError: true};
          }
        })
      )
    }
  }
}

export function isValidTwitchURL(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'www.twitch.tv' || hostname === 'twitch.tv') {
      const id = parsed.pathname.slice(8); // /videos
      return {type: 'twitch', validId: !isNaN(+id), id};
    } else {
      return {type: 'unknown'};
    }
  } catch {
    return {invalidUrl: true};
  }
}


export function isValidYouTubeURL(url): { type?: string, invalidUrl?: boolean, validId?: boolean, id?: string } {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'www.youtube.com' || hostname === 'youtube.com') {
      const path = parsed.pathname;
      const videoId = parsed.searchParams.get('v');
      return {type: 'youtube', validId: path === '/watch' && videoId && videoId.length === 11, id: videoId};
    }
    if (hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1);
      return {type: 'youtube', validId: id.length === 11, id};
    }
    return {type: 'unknown'};
  } catch {
    return {invalidUrl: true};
  }
}
