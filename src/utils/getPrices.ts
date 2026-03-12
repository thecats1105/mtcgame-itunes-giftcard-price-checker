import dayjs from 'dayjs'
import type { Prices, PriceHistories } from '../types/prices'
import Database from './Database'
import productList from '../product_list.json'

const db = new Database()

const validAmounts = new Set(productList.list.map(p => p.amount))

function filterByProductList(prices: Prices | null): Prices | null {
  if (!prices) return null
  const filtered = prices.filter(
    p => p.amount !== undefined && validAmounts.has(p.amount)
  )
  return filtered.length > 0 ? filtered : null
}

export default async function getPrices(): Promise<PriceHistories> {
  const currentDate = dayjs().format('YYYY-MM-DD')
  const yesterdayDate = dayjs(currentDate)
    .subtract(1, 'day')
    .format('YYYY-MM-DD')
  const lastWeekDate = dayjs(currentDate)
    .subtract(7, 'day')
    .format('YYYY-MM-DD')
  const lastMonthDate = dayjs(currentDate)
    .subtract(30, 'day')
    .format('YYYY-MM-DD')

  const response = await db.bulkGet([
    currentDate,
    yesterdayDate,
    lastWeekDate,
    lastMonthDate
  ])

  return {
    current: filterByProductList(response[currentDate] ?? null),
    yesterday: filterByProductList(response[yesterdayDate] ?? null),
    lastWeek: filterByProductList(response[lastWeekDate] ?? null),
    lastMonth: filterByProductList(response[lastMonthDate] ?? null)
  }
}
