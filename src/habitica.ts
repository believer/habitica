import { HttpMethod, User, ArmoireResult, Party, Spell } from './types'
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
      headers: {
        'x-api-user': this.config.user.id,
        'x-api-key': this.config.user.key,
      },
    }).getContentText()
    const { data } = JSON.parse(response)

    return data
  }

  private getUser() {
    return this.fetch<User>('/user?userFields=stats,items')
  }

  private getParty() {
    return this.fetch<Party>('/groups/party')
  }

  private castSpell(spell: Spell, threshold: number) {
    const {
      stats: { mp: mana },
    } = this.getUser()

    if (mana > threshold) {
      this.fetch(`/user/class/cast/${spell}`, HttpMethod.POST)
      Logger.log(`Casting *${spell}*`)
    } else {
      Logger.log(`Mana is at ${mana}. Threshold = ${threshold}`)
    }
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
    this.castSpell(Spell.Earthquake, this.config.manaThresholds.earthquake)
  }

  toolsOfTrade(): void {
    this.castSpell(Spell.ToolsOfTrade, this.config.manaThresholds.toolsOfTrade)
  }

  hatchPets(): void {
    const { items } = this.getUser()

    const eggs = hasItems(items.eggs)

    if (eggs.length === 0) {
      Logger.log('All out of eggs')
      return
    }

    const hatchingPotions = hasItems(items.hatchingPotions)

    if (hatchingPotions.length === 0) {
      Logger.log('All out of potions')
      return
    }

    const pets = hasItems(items.pets)

    const combinations = eggs
      .map((egg) => hatchingPotions.map((potion) => `${egg}-${potion}`))
      .map(
        (combinedPets) =>
          combinedPets.filter((p) => !pets.some((pet) => pet === p))[0]
      )

    combinations.forEach((combo) => {
      const [pet, egg] = combo.split('-')
      this.fetch(`/user/hatch/${pet}/${egg}`, HttpMethod.POST)
      Logger.log(`Hatching ${egg} ${pet}`)
    })
  }

  feedPets(): void {
    const { items } = this.getUser()

    const foods = Object.entries(items.food).filter(([_, value]) => value > 0)

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

    const validPets = [
      'BearCub',
      'Cactus',
      'Dragon',
      'FlyingPig',
      'Fox',
      'LionCub',
      'PandaCub',
      'TigerCub',
      'Wolf',
    ]

    const pets = hasItems(items.pets)
      .map((pet) => pet.split('-'))
      .filter(([pet]) => validPets.includes(pet))
      .map(([pet, color]) => [`${pet}-${color}`, foodMap[color]])
      .filter(([_, food]) => food)

    const feed = foods.map(([food, value]) => {
      return [...pets.find(([_, petLikes]) => food === petLikes), value]
    })

    feed.forEach(([pet, food, amount]) => {
      this.fetch(
        `/user/feed/${pet}/${food}${amount > 1 ? `?amount=${amount}` : ''}`,
        HttpMethod.POST
      )
      Logger.log(`Feeding ${food} to ${pet}`)
    })
  }

  joinQuest(): void {
    const { quest } = this.getParty()

    if (!quest.key) {
      Logger.log('No current quest')
      return
    }

    if (quest.active) {
      Logger.log('Quest has already started')
      return
    }

    if (quest.members[this.config.user.id]) {
      Logger.log('You have already joined the quest')
      return
    }

    this.fetch('/groups/party/quests/accept', HttpMethod.POST)
    Logger.log('You have joined the quest! Happy hunting')
  }

  healthPotion(): void {
    const {
      stats: { hp, gp },
    } = this.getUser()

    if (hp > this.config.healthThresholds.health) {
      Logger.log('You are healthy enough')
      return
    }

    if (gp < 25) {
      Logger.log('Not enough gold to buy a health potion')
      return
    }

    this.fetch('/user/buy-health-potion', HttpMethod.POST)
    Logger.log(`You are healed up. Current hp = ${hp + 15}`)
  }
}
