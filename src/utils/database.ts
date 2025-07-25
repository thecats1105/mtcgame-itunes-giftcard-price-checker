import Cloudflare from 'cloudflare'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import scrapePrice from './scrap'
import type { PriceHistories } from '../types/prices'
import type { NamespaceBulkGetResponse } from 'cloudflare/resources/kv'

dayjs.extend(timezone)
dayjs.tz.setDefault('Asia/Seoul')

const {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_KV_NAMESPACE_ID
} = process.env

if (
  !CLOUDFLARE_ACCOUNT_ID ||
  !CLOUDFLARE_API_TOKEN ||
  !CLOUDFLARE_KV_NAMESPACE_ID
) {
  throw new Error('Missing required environment variables')
}

const client = new Cloudflare()

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
      current: JSON.parse(response?.values?.[currentDate] as string),
      yesterday: JSON.parse(response?.values?.[yesterdayDate] as string),
      lastWeek: JSON.parse(response?.values?.[lastWeekDate] as string),
      lastMonth: JSON.parse(response?.values?.[lastMonthDate] as string)
    }
  }

  async savePrices(): Promise<void> {
    const currentDate = dayjs().format('YYYY-MM-DD')

    const prices = await scrapePrice().catch(error => {
      throw new Error(`Failed to scrape prices: ${error.message}`)
    })

    await this.update(currentDate, JSON.stringify(prices)).catch(error => {
      throw new Error(
        `Failed to save prices for ${currentDate}: ${error.message}`
      )
    })
  }

  private async bulkGet(
    keys: string[]
  ): Promise<NamespaceBulkGetResponse | null> {
    return await client.kv.namespaces
      .bulkGet(CLOUDFLARE_KV_NAMESPACE_ID!, {
        account_id: CLOUDFLARE_ACCOUNT_ID!,
        keys
      })
      .catch(error => {
        throw new Error(`Failed to bulk get keys: ${error.message}`)
      })
  }

  // private async delete(key: string): Promise<void> {
  //   await client.kv.namespaces.values
  //     .delete(CLOUDFLARE_KV_NAMESPACE_ID!, key, {
  //       account_id: CLOUDFLARE_ACCOUNT_ID!
  //     })
  //     .catch(() => {
  //       throw new Error(`Failed to delete key: ${key}.`)
  //     })
  // }

  // private async get(key: string): Promise<string> {
  //   return (
  //     await client.kv.namespaces.values
  //       .get(CLOUDFLARE_KV_NAMESPACE_ID!, key, {
  //         account_id: CLOUDFLARE_ACCOUNT_ID!
  //       })
  //       .catch(() => {
  //         throw new Error(`Failed to get key: ${key}.`)
  //       })
  //   ).text()
  // }

  private async update(key: string, value: string): Promise<void> {
    await client.kv.namespaces.values
      .update(CLOUDFLARE_KV_NAMESPACE_ID!, key, {
        account_id: CLOUDFLARE_ACCOUNT_ID!,
        value
      })
      .catch(() => {
        throw new Error(`Failed to update key: ${key}.`)
      })
  }
}
