export const QUILL_CONFIG = {
  toolbar: [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    // [{list: 'ordered'}, {list: 'bullet'}],
    [{
      header: [1, 2, 3,
        // 4, 5, 6,
        false]
    }],
    [{color: []}, {background: []}],
    // ['link'],
    ['clean'],
  ],
}

// pour limiter les krosmiques à 7 et infinites à 5
export const RARITY_LIMIT = {
  COMMUNE: -1,
  PEU_COMMUNE: -1,
  RARE: -1,
  KROSMIQUE: 7,
  INFINITE: 5
}

// pour limiter le nombre d'exemplaires max d'une carte.
// 3 pour tout le monde sauf les krosmiques / infinites à 1
export const COPY_LIMIT = {
  COMMUNE: 3,
  PEU_COMMUNE: 3,
  RARE: 3,
  KROSMIQUE: 1,
  INFINITE: 1
}
