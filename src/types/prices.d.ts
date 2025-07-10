export interface Price {
  amount: number | undefined
  price: number | undefined
}

export type Prices = Array<Price>

export interface PriceHistories {
  current: Prices | null
  yesterday: Prices | null
  lastWeek: Prices | null
  lastMonth: Prices | null
}
