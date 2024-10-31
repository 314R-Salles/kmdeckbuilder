export class CardFilterForm {
  isSpell: boolean | null
  hpGreaterThan: number | null;
  hpLessThan: number | null;
  apGreaterThan: number | null;
  apLessThan: number | null;
  mpGreaterThan: number | null;
  mpLessThan: number | null;
  atGreaterThan: number | null;
  atLessThan: number | null;
  god: number | null;
  rarity: number | null;
  extension: number | null;
  language: number | null;
  content: string | null;
  pageNumber: number | null;
  pageContent: number | null;

  constructor(isSpell: boolean | null,
              hpGreaterThan: number| null,
              hpLessThan: number| null,
              apGreaterThan: number| null,
              apLessThan: number| null,
              mpGreaterThan: number| null,
              mpLessThan: number| null,
              atGreaterThan: number| null,
              atLessThan: number| null,
              god: number| null,
              rarity: number| null,
              extension: number| null,
              language: number| null,
              content: string| null,
              pageNumber: number| null,
              pageContent: number) {
    this.isSpell = isSpell;
    this.hpGreaterThan = hpGreaterThan;
    this.hpLessThan = hpLessThan;
    this.apGreaterThan = apGreaterThan;
    this.apLessThan = apLessThan;
    this.mpGreaterThan = mpGreaterThan;
    this.mpLessThan = mpLessThan;
    this.atGreaterThan = atGreaterThan;
    this.atLessThan = atLessThan;
    this.god = god;
    this.rarity = rarity;
    this.extension = extension;
    this.language = language;
    this.content = content;
    this.pageNumber = pageNumber;
    this.pageContent = pageContent;
  }
}
