import { HttpMethod, User, ArmoireResult } from './types'
import config from './config'

export default class Habitica {
  private baseUrl = 'https://habitica.com/api/v3'
  private config = config

  private fetch<T = any>(url: string, method: HttpMethod = HttpMethod.GET): T {
    const response = UrlFetchApp.fetch(`${this.baseUrl}${url}`, {
      method,
      headers: this.config.headers,
    }).getContentText()
    const { data } = JSON.parse(response)

    return data
  }

  private getUser(): User {
    return this.fetch('/user?userFields=stats')
  }

  buyArmoire(): void {
    const {
      stats: { gp: gold },
    } = this.getUser()

    if (gold > this.config.goldThresholds.armoire) {
      const { armoire } = this.fetch<ArmoireResult>(
        '/user/buy-armoire',
        HttpMethod.POST
      )

      if (armoire.type === 'food') {
        Logger.log(`You gained ${armoire.dropText}`)
      } else {
        Logger.log(`You gained ${armoire.value} ${armoire.type}`)
      }
    } else {
      Logger.log(
        `Wallet contains ${gold} coins. Threshold = ${this.config.goldThresholds.armoire}`
      )
    }
  }

  earthquake(): void {
    const {
      stats: { mp: mana },
    } = this.getUser()

    if (mana > this.config.manaThresholds.earthquake) {
      this.fetch('/user/class/cast/earth', HttpMethod.POST)
      Logger.log('Casting *earthquake*')
    } else {
      Logger.log(
        `Mana is at ${mana}. Threshold = ${this.config.manaThresholds.earthquake}`
      )
    }
  }
}
