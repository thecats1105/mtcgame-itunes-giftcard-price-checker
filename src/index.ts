import { EmbedBuilder, WebhookClient } from "discord.js"
import Cloudflare from 'cloudflare'

// Ensure that the required environment variables are set
const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN, DISCORD_WEBHOOK_ID, DISCORD_WEBHOOK_TOKEN } = process.env

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN || !DISCORD_WEBHOOK_ID || !DISCORD_WEBHOOK_TOKEN) {
  throw new Error('Missing required environment variables')
}

const cloudflareClinet = new Cloudflare()

// Define the target URL and selector for scraping
const targetUrl = 'https://www.mtcgame.com/ko-KR/apple-store/itunes-hediye-karti/itunes-hediye-karti-250-tl-bakiye?currency=KRW'
const selector = '#__next > main > div.bg-mtc-dark > div.pt-\\[4rem\\].sm\\:pt-0.dark > div.container.mx-auto.px-4.py-4.lg\\:py-10 > div > div.lg\\:w-2\\/6.order-1.lg\\:order-2 > div > div.space-y-4 > div > span.font-bold'

// Create an embed message to send to Discord
const embed = new EmbedBuilder()
  .setTitle('MTCGAME iTunes Gift Card Turkey')
  .setURL(targetUrl)
  .setDescription('250TL iTunes Gift Card 가격 정보')
  .addFields({ name: '가격', value: `₩${await getPrice() || '오류가 발생했습니다!'}`, inline: true })
  .setColor('#447D9B')
  .setTimestamp()

// Create a Discord webhook client and send the embed message
const webhook = new WebhookClient({ id: DISCORD_WEBHOOK_ID, token: DISCORD_WEBHOOK_TOKEN })
webhook.send({
  username: 'MTCGAME Price Notifier',
  content: '현재 가격 정보를 알려 드립니다!',
  embeds: [embed],
})

// Function to fetch the price from the target URL using the specified selector
async function getPrice(): Promise<string | undefined> {
  const scrapes = await cloudflareClinet.browserRendering.scrape.create({
    account_id: CLOUDFLARE_ACCOUNT_ID,
    elements: [{ selector }],
    url: targetUrl
  })

  const price = scrapes[0]?.results[0]?.text

  return price?.replace(/₩|,/g, '') || undefined
}
