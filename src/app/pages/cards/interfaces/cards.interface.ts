export interface Card {
  id: number,
  name: string,
  description: string,
  power?: number,
  defense?: number,
  type?: number,
  class?: number,
  mana?: number
}

export enum CardType {
  Magia = 0,
  Criatura = 1,
}

export enum CardClass {
  Mago = 0,
  Paladino = 1,
  Caçador = 2,
  Druida = 3,
  Qualquer = 4
}

