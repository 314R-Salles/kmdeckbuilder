import {AfterViewInit, Component, Inject, OnInit, PLATFORM_ID} from '@angular/core';
import {ApiService} from "../api/api.service";
import {Stream} from "../models/stream";
import {Vod} from "../models/vod";
import {YtVideo} from "../models/ytVideo";
import {isPlatformBrowser} from "@angular/common";

@Component({
  selector: 'app-stream-list',
  templateUrl: './stream-list.component.html',
  styleUrl: './stream-list.component.scss'
})
export class StreamListComponent implements AfterViewInit {

  streams: Stream[];
  vods: Vod[];
  videos: YtVideo[];

  constructor(private apiService: ApiService,
              @Inject(PLATFORM_ID) private platformId: any) {
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.getElementById("default").click(); // on demande d'activer le 1er onglet en amont de charger les données
      this.apiService.getStreams().subscribe(streams => {
        this.streams = this.updateStreamUrls(streams)
        this.apiService.getVods().subscribe(vods => this.vods = this.updateVodUrls(vods))
      })
      // this.apiService.getLastVideos().subscribe(videos => this.videos = videos)
    }
  }

  updateStreamUrls(streams: Stream[]): Stream[] {
    return streams.map(stream => {
        return {
          ...stream,
          url: 'https://www.twitch.tv/' + stream.username,
          thumbnailUrl:
            stream.thumbnailUrl
              .replace('{width}', '320')
              .replace('{height}', '180'),
        }
      }
    );
  }

  updateVodUrls(vods: Vod[]): Vod[] {
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

  openStream(evt, streamName): void {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("streams-panel");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("streams-tab-link");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(streamName).style.display = "flex";
    evt.currentTarget.className += " active";
  }

  makeDate(date): string {
    var now = new Date();
    var posted = new Date(date);

    var distance = now.getTime() - posted.getTime();
    if (distance < 60 * 60 * 1000) {
      return Math.round(distance / (60 * 1000)) + " minutes ago"
    } else if (distance < 24 * 60 * 60 * 1000) {
      return Math.round(distance / (60 * 60 * 1000)) + " hours ago"
    } else if (distance < 30 * 24 * 60 * 60 * 1000) {
      return Math.round(distance / (24 * 60 * 60 * 1000)) + " days ago"
    } else {
      return Math.round(distance / (30 * 24 * 60 * 60 * 1000)) + " months ago"
    }
  }
}
