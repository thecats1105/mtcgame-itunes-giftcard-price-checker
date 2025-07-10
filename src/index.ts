import { WebhookClient } from 'discord.js'
import Embed from './utils/embed'
import Database from './utils/database'

// Ensure that the required environment variables are set
const { DISCORD_WEBHOOK_ID, DISCORD_WEBHOOK_TOKEN } = process.env

if (!DISCORD_WEBHOOK_ID || !DISCORD_WEBHOOK_TOKEN) {
  throw new Error('Missing required environment variables')
}

const database = new Database()

await database.savePrices()

const priceHistories = await database.getPrices()

// Create an embed message to send to Discord
const embeds = {
  current: new Embed().current(priceHistories),
  yesterday: new Embed().yesterday(priceHistories),
  lastWeek: new Embed().lastWeek(priceHistories),
  lastMonth: new Embed().lastMonth(priceHistories)
}

// Create a Discord webhook client and send the embed message
const webhook = new WebhookClient({
  id: DISCORD_WEBHOOK_ID,
  token: DISCORD_WEBHOOK_TOKEN
})
webhook.send({
  username: 'MTCGAME Price Notifier',
  embeds: [embeds.current, embeds.yesterday, embeds.lastWeek, embeds.lastMonth]
})
