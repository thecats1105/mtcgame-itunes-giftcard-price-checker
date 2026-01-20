import { EmbedBuilder } from 'discord.js'
import productList from '../product_list.json'
import type { PriceHistories, Prices } from '../types/prices'

export default class Embed {
  private createPriceHistoryEmbed(
    title: string,
    currentPrices: Prices | null,
    historyPrices: Prices | null
  ): EmbedBuilder {
    const currentLastPrice = currentPrices?.at(-1)?.price
    const historyLastPrice = historyPrices?.at(-1)?.price

    let description = ''
    if (currentLastPrice && historyLastPrice) {
      if (currentLastPrice === historyLastPrice) {
        description = '변동 없음'
      } else {
        const percentageChange = (
          ((currentLastPrice - historyLastPrice) / historyLastPrice) *
          100
        ).toFixed(2)
        description = `${title} 대비 ${percentageChange}% ${
          currentLastPrice > historyLastPrice ? '🔺' : '🔻'
        }`
      }
    } else if (!historyPrices) {
      description = '정보 없음'
    }

    const embed = new EmbedBuilder()
      .setTitle(title)
      .setDescription(description)
      .setColor('#447D9B')
      .setTimestamp()

    if (
      !(
        currentLastPrice &&
        historyLastPrice &&
        currentLastPrice === historyLastPrice
      )
    ) {
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
