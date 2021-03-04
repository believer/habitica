export enum HttpMethod {
  GET = 'get',
  POST = 'post',
}

interface UserStats {
  gp: number
  mp: number
}

interface UserItems {
  eggs: { [key: string]: number }
  food: { [key: string]: number }
  hatchingPotions: { [key: string]: number }
  pets: { [key: string]: number }
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
