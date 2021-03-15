export enum HttpMethod {
  GET = 'get',
  POST = 'post',
}

export enum Spell {
  Earthquake = 'earth',
  ToolsOfTrade = 'toolsOfTrade',
}

interface UserStats {
  hp: number
  gp: number
  mp: number
}

interface UserItems {
  eggs: { [key: string]: number }
  food: { [key: string]: number }
  hatchingPotions: { [key: string]: number }
  pets: { [key: string]: number }
  mounts: { [key: string]: boolean }
}

export interface User {
  items: UserItems
  stats: UserStats
}

export interface ArmoireResult {
  armoire: {
    dropText: string
    type: string
    value: number
  }
}

interface Quest {
  active: boolean
  members: { [key: string]: boolean | null }
  key?: string
}

export interface Party {
  quest: Quest
}
