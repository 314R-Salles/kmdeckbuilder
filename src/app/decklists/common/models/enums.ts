export enum CardRarity {
  COMMUNE,
  PEU_COMMUNE,
  RARE,
  KROSMIQUE,
  INFINITE
}

export const {COMMUNE, PEU_COMMUNE, RARE, KROSMIQUE, INFINITE} = CardRarity;


export enum CardType {
  CREA, SORT
}

export const {CREA, SORT} = CardType;

export enum God {
  NEUTRE,
  IOP,
  CRA,
  ENIRIPSA,
  ECAFLIP,
  ENUTROF,
  SRAM,
  XELOR,
  SACRIEUR,
  FECA,
  SADIDA
}


export enum Language {
  FR = 'FR',
  EN = 'EN',
  ES = 'ES',
  BR = 'BR',
  RU = 'RU'
}


export const DEFAULT_CARD = {
  id: -1, name: 'empty'
}
