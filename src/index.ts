import { WebhookClient } from 'discord.js'
import Embed from './utils/Embed'
import getPrices from './utils/getPrices'
import savePrices from './utils/savePrices'

// Ensure that the required environment variables are set
const { DISCORD_WEBHOOK_ID, DISCORD_WEBHOOK_TOKEN } = process.env

if (!DISCORD_WEBHOOK_ID || !DISCORD_WEBHOOK_TOKEN) {
  throw new Error('Missing required environment variables')
}

// Save the current prices to the database
await savePrices()

// Get the price histories from the database
const priceHistories = await getPrices()

// Create an embed message to send to Discord
const embeds = {
  current: new Embed().current(priceHistories),
  yesterday: new Embed().yesterday(priceHistories),
  lastWeek: new Embed().lastWeek(priceHistories),
  lastMonth: new Embed().lastMonth(priceHistories)
}

// Create a Discord webhook client and send the embed message
const webhook = new WebhookClient({
  id: DISCORD_WEBHOOK_ID!,
  token: DISCORD_WEBHOOK_TOKEN!
})

webhook.send({
  username: 'MTCGAME Price Notifier',
  embeds: [embeds.current, embeds.yesterday, embeds.lastWeek, embeds.lastMonth]
})
