// Un modèle "commun pour vod et stream"

export class TwitchModel {
  id: string = ''
  username: string = ''
  displayName: string = ''
  title: string = ''
  created_at: string = ''
  url: string = ''
  thumbnailUrl: string = ''
  viewCount: string = ''
  language: string = ''
  type: string = ''
  duration: string = ''
  profileImage: string = ''
  live: boolean = false
  viewerCount: string = ''
  startedAt: string = ''
  tags: string[] = []

  fake: boolean = false
}

export const PLACEHOLDER: TwitchModel = {
  id: "", username: "", displayName: "", title: 'Aucun live en cours.', created_at: "", url: "",
  thumbnailUrl: '/assets/public/nothing_placeholder.png', viewCount: "", language: "", type: "", duration: "",
  profileImage: "", live: false, viewerCount: "", startedAt: "", tags: [], fake: true
}
