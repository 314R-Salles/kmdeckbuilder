import {AfterViewInit, Component, inject, input, PLATFORM_ID, signal} from '@angular/core';
import {PLACEHOLDER, TwitchModel} from '../base/models/twitch.model';
import {YtVideo} from '../base/models/ytVideo';
import {ApiService} from '../api/api.service';
import {isPlatformBrowser, NgTemplateOutlet} from '@angular/common';
import {Section} from '../base/section/section';

@Component({
  selector: 'app-stream-list',
  imports: [
    NgTemplateOutlet,
    Section
  ],
  templateUrl: './stream-list.html',
  styleUrl: './stream-list.scss'
})
export class StreamList implements AfterViewInit {

  frontPage = input<boolean>(false);

  streams = signal<TwitchModel[]>([])
  vods = signal<TwitchModel[]>([])
  videos = signal<YtVideo[]>([])


  notEnoughLiveStream = false

  apiService = inject(ApiService)
  platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.apiService.getStreams().subscribe(streams => {
        this.streams.set(this.updateStreams(streams))

        if (this.streams().length == 0) {
          this.streams.update(values => {
            return [...values, PLACEHOLDER];
          });
        }

        if (this.streams().length < 4 && this.frontPage()) {
          this.notEnoughLiveStream = true
          this.apiService.getVods().subscribe(vods => {
            vods = vods
              // cacher les vods temporaires pendant les streams
              .filter(vod => vod.thumbnailUrl !== "https://vod-secure.twitch.tv/_404/404_processing_%{width}x%{height}.png")
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
              .splice(0, 11)
          )))
        this.apiService.getLastVideos().subscribe(videos => this.videos.set(this.updateYoutubeVideos(videos).splice(0, 11)))
      }
    }
  }

  updateStreams(streams: TwitchModel[]): TwitchModel[] {
    return streams.map(stream => {
        return {
          ...stream,
          url: 'https://www.twitch.tv/' + stream.username,
          live: true,
          startedAt: this.makeDate(stream.startedAt),
          thumbnailUrl:
            stream.thumbnailUrl
              .replace('{width}', '320')
              .replace('{height}', '180'),
        }
      }
    );
  }

  updateVods(vods: TwitchModel[]): TwitchModel[] {
    return vods.map(vod => {
        return {
          ...vod,
          live: false,
          created_at: this.makeDate(vod.created_at),
          thumbnailUrl:
            vod.thumbnailUrl
              .replace('%{width}', '320')
              .replace('%{height}', '180'),
        }
      }
    );
  }

  updateYoutubeVideos(videos: YtVideo[]): YtVideo[] {
    return videos.map(video => {
        return {
          ...video,
          publishedAt: this.makeDate(video.publishedAt),
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
