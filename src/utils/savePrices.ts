import dayjs from 'dayjs'
import scrapePrice from './scrapPrices'
import Database from './Database'

const db = new Database()

export default async function savePrices(): Promise<void> {
  const currentDate = dayjs().format('YYYY-MM-DD')

  const prices = await scrapePrice().catch(error => {
    throw new Error(`Failed to scrape prices: ${error.message}`)
  })

  await db.update(currentDate, prices)
}
