import puppeteer from 'puppeteer'
import productList from './product_list.json'
import type { Price, Prices } from '../types/prices'

const targetUrl = productList.url

export default async function scrapePrice(): Promise<Prices> {
  const selectors = productList.list.map(product => product.selector)

  const scrapes = await createScrape(targetUrl, selectors)

  return scrapes.map(
    (scrape, i): Price => ({
      amount: productList.list[i]?.amount,
      price: Number(scrape.results[0]?.replace(/₩|,/g, '').trim()) || undefined
    })
  )
}

async function createScrape(
  url: string,
  selectors: string[]
): Promise<{ selector: string; results: string[] }[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  })

  const page = await browser.newPage()
  await page.goto(url)

  const results = await Promise.all(
    selectors.map(selector =>
      page.$$eval(selector, els => els.map(el => el.textContent))
    )
  )

  await browser.close()

  return selectors.map((selector, i) => ({
    selector,
    results: results[i] || []
  }))
}
