import {CardRarity, CardType, God} from "./enums";

export class Card {
  // id: number;
  // language?: number;
  // god: number;
  name: string;
  // description?: string;
  // atk?: number;
  // cost?: number;
  // health?: number;
  // mp?: number;
  // isSpell?: boolean;
  // family?: string;
  // rarity: number;
  // extension?: number;
  // imageLink?: string;
  // idInfinite?: number;


  cardFilePath : string

  // attack: number;
  id : number;
  cardType: CardType ;// CREA/SPELL
  costAP: number;
  // description : string ;// Mais osef
  // extensionId: number;
  // family1 ;// osef
  // family2 ;// osef
  godType: God; // enum
  infiniteName : string;
  // life;
  miniFilePath: string;
  // movementPoint
  // name
  rarity: CardRarity;
}
