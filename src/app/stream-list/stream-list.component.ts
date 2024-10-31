import {Component, OnInit} from '@angular/core';
import {ApiService} from "../api/api.service";
import {Stream} from "../models/stream";
import {Vod} from "../models/vod";
import {YtVideo} from "../models/ytVideo";

@Component({
  selector: 'app-stream-list',
  templateUrl: './stream-list.component.html',
  styleUrl: './stream-list.component.scss'
})
export class StreamListComponent implements OnInit {

  streams: Stream[];
  vods: Vod[];
  videos: YtVideo[];

  constructor(private apiService: ApiService) {
  }

  ngOnInit(): void {
    this.apiService.getStreams().subscribe(streams => {
      this.streams = this.updateStreamUrls(streams)
      this.apiService.getVods().subscribe(vods => this.vods = this.updateVodUrls(vods))
    })

    // this.apiService.getLastVideos().subscribe(videos => this.videos = videos)
  }

  // Pas besoin de replace pour les images de profil / de deconnexion.
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

  // Pas besoin de replace pour les images de profil / de deconnexion.
  updateVodUrls(vods: Vod[]): Vod[] {
    return vods.map(vod => {
        return {
          ...vod,
          thumbnailUrl:
            vod.thumbnailUrl
              .replace('%{width}', '320')
              .replace('%{height}', '180'),
        }
      }
    );
  }


}
