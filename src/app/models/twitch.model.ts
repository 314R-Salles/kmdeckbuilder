// Un modèle "commun pour vod et stream"

export class TwitchModel {
  id: string;
  username: string;
  displayName: string;
  title: string;
  created_at: string;
  url: string;
  thumbnailUrl: string;
  viewCount: string;
  language: string;
  type: string;
  duration: string;
  profileImage: string;

  live: boolean;
  viewerCount:string;
  startedAt:string;
  tags:string;

  fake : boolean
}

export const PLACEHOLDER = {
  id: null, username: null, displayName: null, title: 'ya sonper', created_at: null, url: null,
  thumbnailUrl: '/assets/public/nothing_placeholder.png', viewCount: null, language: null, type: null, duration: null,
  profileImage: null, live: false, viewerCount: null, startedAt: null, tags: null, fake: true
}
