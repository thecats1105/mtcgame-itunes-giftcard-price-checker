import { EmbedBuilder } from 'discord.js'
import type { PriceHistories } from '../types/prices'

export default class Embed {
  current(priceHistories: PriceHistories): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle('MTCGAME iTunes Gift Card Turkey')
      .setURL(
        'https://www.mtcgame.com/ko-KR/apple-store/itunes-hediye-karti/itunes-hediye-karti?currency=KRW'
      )
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
    return new EmbedBuilder()
      .setTitle('어제')
      .setDescription(priceHistories.yesterday ? null : '정보 없음')
      .addFields(
        priceHistories.yesterday
          ? priceHistories.yesterday.map(p => ({
              name: `₺${p.amount}`,
              value: `₩${p.price?.toLocaleString() || '정보 없음'}`,
              inline: true
            }))
          : []
      )
      .setColor('#447D9B')
      .setTimestamp()
  }

  lastWeek(priceHistories: PriceHistories): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle('지난 주')
      .setDescription(priceHistories.lastWeek ? null : '정보 없음')
      .addFields(
        priceHistories.lastWeek
          ? priceHistories.lastWeek.map(p => ({
              name: `₺${p.amount}`,
              value: `₩${p.price?.toLocaleString() || '정보 없음'}`,
              inline: true
            }))
          : []
      )
      .setColor('#447D9B')
      .setTimestamp()
  }

  lastMonth(priceHistories: PriceHistories): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle('지난 달')
      .setDescription(priceHistories.lastMonth ? null : '정보 없음')
      .addFields(
        priceHistories.lastMonth
          ? priceHistories.lastMonth.map(p => ({
              name: `₺${p.amount}`,
              value: `₩${p.price?.toLocaleString() || '정보 없음'}`,
              inline: true
            }))
          : []
      )
      .setColor('#447D9B')
      .setTimestamp()
  }
}
