export const customSort = (cardA, cardB) => {
  if (cardA.costAP != cardB.costAP) return cardA.costAP - cardB.costAP
  else return cardA.name.localeCompare(cardB.name)
}
