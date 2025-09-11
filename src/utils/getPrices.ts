import dayjs from 'dayjs'
import type { PriceHistories } from '../types/prices'
import Database from './Database'

const db = new Database()

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
    current: response[currentDate] ?? null,
    yesterday: response[yesterdayDate] ?? null,
    lastWeek: response[lastWeekDate] ?? null,
    lastMonth: response[lastMonthDate] ?? null
  }
}
