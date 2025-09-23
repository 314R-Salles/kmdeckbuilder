import {AfterViewInit, Component, inject, input, PLATFORM_ID, signal} from '@angular/core';
import {PLACEHOLDER, MediaModel} from '../base/models/media.model';
import {ApiService} from '../api/api.service';
import {isPlatformBrowser, NgTemplateOutlet, NgStyle} from '@angular/common';
import {Section} from '../base/section/section';
import {TranslatePipe} from "@ngx-translate/core";

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
export class StreamList implements AfterViewInit {

  frontPage = input<boolean>(false);

  streams = signal<MediaModel[]>([])
  vods = signal<MediaModel[]>([])
  videos = signal<MediaModel[]>([])

  notEnoughLiveStream = false
  noLiveStream = false

  apiService = inject(ApiService)
  platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.apiService.getStreams().subscribe(streams => {
        this.noLiveStream = streams.length == 0;

        if (this.noLiveStream) {
          this.streams.set([PLACEHOLDER]);
        } else {
          this.streams.set(this.updateStreams(streams))
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
            vods = this.updateVods(vods)
            this.streams.update(values => {
              return [...values, ...vods];
            });
          })
        }
      })
      if (!this.frontPage()) {
        this.apiService.getVods().subscribe(vods =>
          this.vods.set(this.updateVods(
            vods
              .filter(vod => vod.thumbnailUrl !== "https://vod-secure.twitch.tv/_404/404_processing_%{width}x%{height}.png")
              .filter(vod => vod.duration.includes('h') || Number(vod.duration.split('m')[0]) >= 15)
              .splice(0, 11)
          )))
        this.apiService.getLastVideos().subscribe(videos => this.videos.set(this.updateYoutubeVideos(videos).splice(0, 11)))
      }
    }
  }

  updateStreams(streams: MediaModel[]): MediaModel[] {
    return streams.map(stream => {
        return {
          ...stream,
          created_at: this.makeDate(stream.created_at),
          thumbnailUrl:
            stream.thumbnailUrl
              .replace('{width}', '320')
              .replace('{height}', '180'),
        }
      }
    );
  }

  updateVods(vods: MediaModel[]): MediaModel[] {
    return vods.map(vod => {
        return {
          ...vod,
          created_at: this.makeDate(vod.created_at),
          thumbnailUrl:
            vod.thumbnailUrl
              .replace('%{width}', '320')
              .replace('%{height}', '180'),
        }
      }
    );
  }

  updateYoutubeVideos(videos: MediaModel[]): MediaModel[] {
    return videos.map(video => {
        return {
          ...video,
          created_at: this.makeDate(video.created_at)
        }
      }
    );
  }

  makeDate(date: string): string {
    var now = new Date();
    var posted = new Date(date);

    var distance = now.getTime() - posted.getTime();
    if (distance < 2 * 60 * 1000) {
      return "" + Math.round(distance / (60 * 1000)) + " minute"
    } else if (distance < 60 * 60 * 1000) {
      return "" + Math.round(distance / (60 * 1000)) + " minutes"
    } else if (distance < 2 * 60 * 60 * 1000) {
      return "" + Math.round(distance / (60 * 60 * 1000)) + " heure"
    } else if (distance < 24 * 60 * 60 * 1000) {
      return "" + Math.round(distance / (60 * 60 * 1000)) + " heures"
    } else if (distance < 2 * 24 * 60 * 60 * 1000) {
      return "" + Math.round(distance / (24 * 60 * 60 * 1000)) + " jour"
    } else if (distance < 30 * 24 * 60 * 60 * 1000) {
      return "" + Math.round(distance / (24 * 60 * 60 * 1000)) + " jours"
    } else {
      return "" + Math.round(distance / (30 * 24 * 60 * 60 * 1000)) + " mois"
    }
  }
}
