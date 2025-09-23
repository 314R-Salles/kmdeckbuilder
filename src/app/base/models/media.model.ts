// Un modèle "commun pour vod et stream"

export class MediaModel {
  displayName: string = ''
  title: string = ''
  created_at: string = ''
  url: string = ''
  thumbnailUrl: string = ''
  view: string = ''
  duration: string = ''
  profileImage: string = ''
  live: boolean = false
  youtube: boolean = false
  fake: boolean = false
}

export const PLACEHOLDER: MediaModel = {
  displayName: "", title: 'streamList.noStream.title', created_at: "", url: "",
  thumbnailUrl: '/assets/public/nothing_placeholder.png', view: "", duration: "",
  profileImage: "", live: false, fake: true, youtube: false
}
