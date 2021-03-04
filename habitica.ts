import { HttpMethod, User, ArmoireResult } from './types'
import config from './config'

const hasItems = (items: { [key: string]: number }) =>
  Object.entries(items)
    .filter(([_, value]) => value > 0)
    .flatMap(([item]) => item)

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
    return this.fetch('/user?userFields=stats,items')
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

  hatchPets(): void {
    const { items } = this.getUser()

    const eggs = hasItems(items.eggs)

    if (eggs.length === 0) {
      Logger.log(`All out of eggs`)
      return
    }

    const hatchingPotions = hasItems(items.hatchingPotions)

    const hatch = eggs.map((val, i) =>
      [hatchingPotions].reduce((a, arr) => [...a, arr[i]], [val])
    )

    hatch.forEach(([pet, egg]) => {
      this.fetch(`/user/hatch/${pet}/${egg}`, HttpMethod.POST)
      Logger.log(`Hatching ${egg} ${pet}`)
    })
  }

  feedPets(): void {
    const { items } = this.getUser()

    const foods = hasItems(items.food)

    if (foods.length === 0) {
      Logger.log('All out of food')
    }

    const foodMap = {
      Base: 'Meat',
      CottonCandyBlue: 'CottonCandyBlue',
      CottonCandyPink: 'CottonCandyPink',
      Desert: 'Potatoe',
      Golden: 'Honey',
      Red: 'Strawberry',
      Shade: 'Chocolate',
      Skeleton: 'Fish',
      White: 'Milk',
      Zombie: 'RottenMeat',
    }

    const pets = hasItems(items.pets)
      .map((pet) => {
        const [, color] = pet.split('-')
        return [pet, foodMap[color]]
      })
      .filter(([_, food]) => food)

    const feed = foods.map((food) => {
      return pets.find(([_, petLikes]) => food === petLikes)
    })

    feed.forEach(([pet, food]) => {
      this.fetch(`/user/feed/${pet}/${food}`, HttpMethod.POST)
      Logger.log(`Feeding ${food} to ${pet}`)
    })
  }
}
