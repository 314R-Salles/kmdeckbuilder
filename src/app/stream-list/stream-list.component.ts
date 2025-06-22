import {AfterViewInit, Component, Inject, Input, PLATFORM_ID} from '@angular/core';
import {ApiService} from "../api/api.service";
import {PLACEHOLDER, TwitchModel} from "../models/twitch.model";
import {YtVideo} from "../models/ytVideo";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-stream-list',
  templateUrl: './stream-list.component.html',
  styleUrl: './stream-list.component.scss'
})
export class StreamListComponent implements AfterViewInit {


  @Input() frontPage = false
  notEnoughLiveStream = false

  streams: TwitchModel[];
  vods: TwitchModel[];
  videos: YtVideo[];

  constructor(private apiService: ApiService,
              @Inject(PLATFORM_ID) private platformId: any) {
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.apiService.getStreams().subscribe(streams => {
        this.streams = this.updateStreams(streams)

        if (this.streams.length == 0) {
          this.streams.push(PLACEHOLDER)
        }


        if (this.streams.length < 4 && this.frontPage) {
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
            vods = vods.splice(0, 4 - this.streams.length)
            vods = this.updateVods(vods)
            this.streams.push(...vods)
          })
        }
      })
      if (!this.frontPage) {
        this.apiService.getVods().subscribe(vods =>
          this.vods = this.updateVods(
            vods
              .filter(vod => vod.thumbnailUrl !== "https://vod-secure.twitch.tv/_404/404_processing_%{width}x%{height}.png")
              .splice(0, 11)
          ))
        this.apiService.getLastVideos().subscribe(videos => this.videos = this.updateYoutubeVideos(videos).splice(0, 11))
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

  makeDate(date): string {
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
