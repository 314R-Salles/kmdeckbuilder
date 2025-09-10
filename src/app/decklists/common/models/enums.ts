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

export const GOD_ARRAY = [
  {id: 0, name: 'NEUTRE'},
  {id: 1, name: 'IOP'},
  {id: 2, name: 'CRA'},
  {id: 3, name: 'ENIRIPSA'},
  {id: 4, name: 'ECAFLIP'},
  {id: 5, name: 'ENUTROF'},
  {id: 6, name: 'SRAM'},
  {id: 7, name: 'XELOR'},
  {id: 8, name: 'SACRIEUR'},
  {id: 9, name: 'FECA'},
  {id: 10, name: 'SADIDA'},
]


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
