import type { Prices } from '../types/prices'
import { Client, isFullPage } from '@notionhq/client'

const { NOTION_TOKEN, NOTION_DATA_SOURCE_ID } = process.env

if (!NOTION_TOKEN || !NOTION_DATA_SOURCE_ID) {
  throw new Error('Missing required environment variables')
}

const client = new Client({
  auth: NOTION_TOKEN!,
  notionVersion: '2025-09-03'
})

export default class Database {
  async bulkGet(dates: string[]): Promise<Record<string, Prices | null>> {
    const results = await Promise.all(dates.map(date => this.get(date)))

    return dates.reduce(
      (acc, date, index) => {
        acc[date] = results[index] ?? null
        return acc
      },
      {} as Record<string, Prices | null>
    )
  }

  async get(date: string): Promise<Prices | null> {
    const page = await client.dataSources.query({
      data_source_id: NOTION_DATA_SOURCE_ID!,
      filter: {
        property: 'date',
        date: {
          equals: date
        }
      }
    })

    if (page.results[0] && isFullPage(page.results[0])) {
      const properties = page.results[0].properties
      // Remove non-price properties
      for (const key in properties) {
        if (isNaN(Number(key))) delete properties[key]
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

  async update(date: string, prices: Prices): Promise<void> {
    async function oldPage(): Promise<{
      isAlreadyExist: boolean
      pageId?: string
    }> {
      const page = await client.dataSources.query({
        data_source_id: NOTION_DATA_SOURCE_ID!,
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
        parent: { data_source_id: NOTION_DATA_SOURCE_ID! },
        properties
      })
    }
  }
}
