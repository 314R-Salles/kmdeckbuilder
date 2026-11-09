// Un modèle commun pour tous les types de vidéos

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
  formattedDate?: string = ''
}

export const PLACEHOLDER: MediaModel = {
  displayName: "", title: 'streamList.noStream', created_at: "", url: "",
  thumbnailUrl: '/assets/public/nothing_placeholder.png', view: "", duration: "",
  profileImage: "", live: false, fake: true, youtube: false
}
