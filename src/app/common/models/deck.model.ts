import {CardRarity, CardType, God} from "../../decklists/common/models/enums";

export interface DeckCard {
  id: number;
  count: number;
  costAP: number;
  cardType: CardType;
  rarity: CardRarity;
  highlight: number;
}

export interface DeckHighlight {
  cardId: number;
  highlightOrder: number;
}

export interface DeckTag {
  id: number;
  title: string;
  iconId: string;
  count: number;
  disabled: boolean;
}

export interface Deck {
  deckId: string;
  name: string;
  owner: string;
  owned: boolean;
  description: string | null;
  videoLink: string | null;
  cards: DeckCard[];
  // sérialisé par le backend sous forme du nom de l'enum (ex: "SACRIEUR"), pas sa valeur numérique
  god: keyof typeof God;
  creationDate: string;
  costAP: number;
  costDust: number;
  highlights: DeckHighlight[];
  version: number;
  minorVersion: number;
  versions: string[] | null;
  tags: DeckTag[];
  liked: boolean;
  favoriteCount: number;
}
