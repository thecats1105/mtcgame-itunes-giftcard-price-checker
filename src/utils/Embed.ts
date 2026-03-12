import { EmbedBuilder } from 'discord.js'
import productList from '../product_list.json'
import type { PriceHistories, Prices } from '../types/prices'

function findComparablePrices(
  currentPrices: Prices,
  historyPrices: Prices
): { currentPrice: number; historyPrice: number } | undefined {
  for (let i = historyPrices.length - 1; i >= 0; i--) {
    const historyItem = historyPrices[i]
    if (historyItem?.price === undefined || historyItem.amount === undefined)
      continue

    const currentItem = currentPrices.find(p => p.amount === historyItem.amount)
    if (currentItem?.price !== undefined) {
      return {
        currentPrice: currentItem.price,
        historyPrice: historyItem.price
      }
    }
  }
  return undefined
}

export default class Embed {
  private createPriceHistoryEmbed(
    title: string,
    currentPrices: Prices | null,
    historyPrices: Prices | null
  ): EmbedBuilder {
    const comparable =
      currentPrices && historyPrices
        ? findComparablePrices(currentPrices, historyPrices)
        : undefined

    let description = '정보 없음'
    if (comparable) {
      const { currentPrice, historyPrice } = comparable
      if (currentPrice === historyPrice) {
        description = '변동 없음'
      } else {
        const percentageChange = (
          ((currentPrice - historyPrice) / historyPrice) *
          100
        ).toFixed(2)
        description = `${title} 대비 ${percentageChange}% ${
          currentPrice > historyPrice ? '🔺' : '🔻'
        }`
      }
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor('#447D9B')
      .setTimestamp()

    if (!(comparable && comparable.currentPrice === comparable.historyPrice)) {
      embed.addFields(
        historyPrices
          ? historyPrices.map(p => ({
              name: `₺${p.amount}`,
              value: `₩${p.price?.toLocaleString() || '정보 없음'}`,
              inline: true
            }))
          : []
      )
    }

    return embed
  }

  current(priceHistories: PriceHistories): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle('MTCGAME iTunes Gift Card Turkey')
      .setURL(productList.url)
      .addFields(
        priceHistories.current
          ? priceHistories.current?.map(p => ({
              name: `₺${p.amount}`,
              value: `₩${p.price?.toLocaleString() || '정보 없음'}`,
              inline: true
            }))
          : []
      )
      .setColor('#447D9B')
      .setTimestamp()
  }

  yesterday(priceHistories: PriceHistories): EmbedBuilder {
    return this.createPriceHistoryEmbed(
      '어제',
      priceHistories.current,
      priceHistories.yesterday
    )
  }

  lastWeek(priceHistories: PriceHistories): EmbedBuilder {
    return this.createPriceHistoryEmbed(
      '지난 주',
      priceHistories.current,
      priceHistories.lastWeek
    )
  }

  lastMonth(priceHistories: PriceHistories): EmbedBuilder {
    return this.createPriceHistoryEmbed(
      '지난 달',
      priceHistories.current,
      priceHistories.lastMonth
    )
  }
}
