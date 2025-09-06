import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import scrapePrice from './scrap'
import type { PriceHistories, Prices } from '../types/prices'
import { Client, isFullDatabase, isFullPage } from '@notionhq/client'

dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Seoul')

const { NOTION_TOKEN, NOTION_DATABASE_ID } = process.env

if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
  throw new Error('Missing required environment variables')
}

const client = new Client({
  auth: NOTION_TOKEN!,
  notionVersion: '2025-09-03'
})

export default class Database {
  async getPrices(): Promise<PriceHistories> {
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

    const response = await this.bulkGet([
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

  async savePrices(): Promise<void> {
    const currentDate = dayjs().format('YYYY-MM-DD')

    const prices = await scrapePrice().catch(error => {
      throw new Error(`Failed to scrape prices: ${error.message}`)
    })

    await this.update(currentDate, prices)
  }

  private async bulkGet(
    dates: string[]
  ): Promise<Record<string, Prices | null>> {
    const results = await Promise.all(dates.map(date => this.get(date)))

    return dates.reduce(
      (acc, date, index) => {
        acc[date] = results[index] ?? null
        return acc
      },
      {} as Record<string, Prices | null>
    )
  }

  private async get(date: string): Promise<Prices | null> {
    const data_source_id = await this.getDataSourceId()

    const page = await client.dataSources.query({
      data_source_id,
      filter: {
        property: 'date',
        date: {
          equals: date
        }
      }
    })

    if (page.results[0] && isFullPage(page.results[0])) {
      const properties = page.results[0].properties
      // 'date' 속성 및 키가 비어있는 속성 제거
      delete properties.date
      for (const key in properties) {
        if (key === '') delete properties[key]
      }

      const prices: Prices = Object.keys(properties).map(key => {
        const amount = parseInt(key, 10)
        const prop = properties[key]

        let price: number | undefined
        if (prop && prop.type === 'number') {
          price = prop.number ?? undefined
        }

        return {
          amount: isNaN(amount) ? undefined : amount,
          price
        }
      })

      return prices
    }
    return null
  }

  private async update(date: string, prices: Prices): Promise<void> {
    const data_source_id = await this.getDataSourceId()

    async function oldPage(): Promise<{
      isAlreadyExist: boolean
      pageId?: string
    }> {
      const page = await client.dataSources.query({
        data_source_id,
        filter: {
          property: 'date',
          date: {
            equals: date
          }
        }
      })

      if (page.results[0] && isFullPage(page.results[0])) {
        return {
          isAlreadyExist: true,
          pageId: page.results[0].id
        }
      } else return { isAlreadyExist: false }
    }

    const properties: Record<
      string,
      { date: { start: string } } | { number: number }
    > = {
      date: {
        date: { start: date }
      }
    }

    for (const item of prices) {
      if (item.amount && item.price) {
        properties[item.amount.toString()] = { number: item.price }
      }
    }

    if ((await oldPage()).isAlreadyExist) {
      await client.pages.update({
        page_id: (await oldPage()).pageId!,
        properties
      })
    } else {
      await client.pages.create({
        parent: { database_id: NOTION_DATABASE_ID! },
        properties
      })
    }
  }

  private async getDataSourceId(): Promise<string> {
    const database = await client.databases.retrieve({
      database_id: NOTION_DATABASE_ID!
    })

    let data_source_id
    if (isFullDatabase(database) && database.data_sources[0])
      data_source_id = database.data_sources[0].id
    else throw new Error('No data source found')

    return data_source_id
  }
}
