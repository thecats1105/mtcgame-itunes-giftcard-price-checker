import { EmbedBuilder, WebhookClient } from 'discord.js'
import scrapePrice from './utils/scrap'

// Ensure that the required environment variables are set
const { DISCORD_WEBHOOK_ID, DISCORD_WEBHOOK_TOKEN } = process.env

if (!DISCORD_WEBHOOK_ID || !DISCORD_WEBHOOK_TOKEN) {
  throw new Error('Missing required environment variables')
}

// Scrape the price for the 250TL iTunes Gift Card
const price = (await scrapePrice())?.find(p => p.amount === 250)?.price

// Create an embed message to send to Discord
const embed = new EmbedBuilder()
  .setTitle('MTCGAME iTunes Gift Card Turkey')
  .setURL(
    'https://www.mtcgame.com/ko-KR/apple-store/itunes-hediye-karti/itunes-hediye-karti-250-tl-bakiye?currency=KRW'
  )
  .setDescription('250TL iTunes Gift Card 가격 정보')
  .addFields({
    name: '가격',
    value: `₩${price || '오류가 발생했습니다!'}`,
    inline: true
  })
  .setColor('#447D9B')
  .setTimestamp()

// Create a Discord webhook client and send the embed message
const webhook = new WebhookClient({
  id: DISCORD_WEBHOOK_ID,
  token: DISCORD_WEBHOOK_TOKEN
})
webhook.send({
  username: 'MTCGAME Price Notifier',
  content: '현재 가격 정보를 알려 드립니다!',
  embeds: [embed]
})
