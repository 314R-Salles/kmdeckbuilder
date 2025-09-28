import {AfterViewInit, Component, inject, input, OnDestroy, PLATFORM_ID, signal} from '@angular/core';
import {MediaModel, PLACEHOLDER} from '../base/models/media.model';
import {ApiService} from '../api/api.service';
import {isPlatformBrowser, NgStyle, NgTemplateOutlet} from '@angular/common';
import {Section} from '../base/section/section';
import {TranslatePipe} from "@ngx-translate/core";
import {toSignal} from "@angular/core/rxjs-interop";
import {StoreService} from "../store.service";

@Component({
  selector: 'app-stream-list',
  imports: [
    NgTemplateOutlet,
    NgStyle,
    Section,
    TranslatePipe
  ],
  templateUrl: './stream-list.html',
  styleUrl: './stream-list.scss'
})
export class StreamList implements AfterViewInit, OnDestroy {

  storeService = inject(StoreService);
  apiService = inject(ApiService)
  platformId = inject(PLATFORM_ID);

  frontPage = input<boolean>(false);
  currentLanguage = toSignal(this.storeService.getLanguage())

  streams = signal<MediaModel[]>([])
  vods = signal<MediaModel[]>([])
  videos = signal<MediaModel[]>([])

  notEnoughLiveStream = false
  noLiveStream = false

  subscriptions = []

  constructor() {
    this.subscriptions.push(this.storeService.getLanguage().subscribe(_ => {
      this.updateTimestamps()
    }))
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe())
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.apiService.getStreams().subscribe(streams => {
        this.noLiveStream = streams.length == 0;

        if (this.noLiveStream) {
          this.streams.set([PLACEHOLDER]);
        } else {
          this.streams.set(this.updateMedia(streams))
        }

        if (this.streams().length < 4 && this.frontPage()) {
          this.notEnoughLiveStream = true
          this.apiService.getVodsAndVideos().subscribe(vods => {
            vods = vods
              // cacher les vods temporaires pendant les streams
              .filter(vod => vod.thumbnailUrl !== "https://vod-secure.twitch.tv/_404/404_processing_%{width}x%{height}.png")
              // cacher les vods de moins de 15 minutes (stream cut involontairement)
              .filter(vod => vod.duration.includes('h') || Number(vod.duration.split('m')[0]) >= 15)
              .sort((a, b) => {
                if (a.created_at < b.created_at) {
                  return 1;
                }
                if (a.created_at > b.created_at) {
                  return -1;
                }
                return 0
              });
            vods = vods.splice(0, 4 - this.streams().length)
            vods = this.updateMedia(vods)
            this.streams.update(values => {
              return [...values, ...vods];
            });
          })
        }
      })
      if (!this.frontPage()) {
        this.apiService.getVods().subscribe(vods =>
          this.vods.set(this.updateMedia(
            vods
              .filter(vod => vod.thumbnailUrl !== "https://vod-secure.twitch.tv/_404/404_processing_%{width}x%{height}.png")
              .filter(vod => vod.duration.includes('h') || Number(vod.duration.split('m')[0]) >= 15)
              .splice(0, 11)
          )))
        this.apiService.getLastVideos().subscribe(videos => this.videos.set(this.updateMedia(videos).splice(0, 11)))
      }
    }
  }

  // pour vod et live twitch, le replace est différent, mais ça doit être satisfaisant de chainer les 2, le plus restrictif en premier
  // pour avoir une méthode commune à tous les formats. (youtube n'a pas de placeholder)
  updateMedia(streams: MediaModel[]): MediaModel[] {
    return streams.map(stream => {
        return {
          ...stream,
          formattedDate: this.makeDate(stream.created_at),
          thumbnailUrl:
            stream.thumbnailUrl
              .replace('%{width}', '320').replace('%{height}', '180')
              .replace('{width}', '320').replace('{height}', '180'),
        }
      }
    );
  }

  updateTimestamps() {
    this.streams.update(st => {
      return [...this.updateMedia(st)]
    })
    this.vods.update(st => {
      return [...this.updateMedia(st)]
    })
    this.videos.update(st => {
      return [...this.updateMedia(st)]
    })
  }

  makeDate(date: string): string {
    const MINUTE = 60 * 1000
    const HOUR = 60 * MINUTE
    const DAY = 24 * HOUR
    const MONTH = 30 * DAY


    const now = new Date();
    const posted = new Date(date);

    const distance = now.getTime() - posted.getTime();
    if (distance < 2 * MINUTE) {
      return "1 minute"
    } else if (distance < HOUR) {
      return Math.round(distance / MINUTE) + " minutes"
    } else if (distance < 2 * HOUR) {
      return 1 + this.getTranslation(' heure', ' hour')
    } else if (distance < DAY) {
      return Math.round(distance / HOUR) + this.getTranslation(' heures', ' hours')
    } else if (distance < 2 * DAY) {
      return 1 + this.getTranslation(' jour', ' day')
    } else if (distance < MONTH) {
      return Math.round(distance / DAY) + this.getTranslation(' jours', ' days')
    } else if (distance < 2 * MONTH) {
      return 1 + this.getTranslation(' mois', ' month')
    } else {
      return Math.round(distance / MONTH) + this.getTranslation(' mois', ' months')
    }
  }

  getTranslation(fr, en) {
    return this.currentLanguage() === 'FR' ? fr : en
  }

}
