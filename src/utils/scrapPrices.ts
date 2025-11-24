import Cloudflare from 'cloudflare'
import productList from './product_list.json'
import type { Price, Prices } from '../types/prices'

// Ensure that the required environment variables are set
const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = process.env

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN) {
  throw new Error('Missing required environment variables')
}

const targetUrl =
  'https://www.mtcgame.com/ko/apple-store/itunes-hediye-karti?currency=KRW'

const client = new Cloudflare()

export default async function scrapePrice(): Promise<Prices> {
  const scrapes = await client.browserRendering.scrape.create({
    account_id: CLOUDFLARE_ACCOUNT_ID!,
    elements: productList.map(product => ({
      selector: product.selector
    })),
    url: targetUrl
  })

  return scrapes.map(
    (scrape, index: number): Price => ({
      amount: productList[index]?.amount,
      // @ts-expect-error cloudflare-typescript has a wrong type definition
      price: Number(scrape.results[0].text?.replace(/₩|,/g, '')) || undefined
    })
  )
}
