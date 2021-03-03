export enum HttpMethod {
  GET = 'get',
  POST = 'post',
}

export interface User {
  stats: {
    gp: number
    mp: number
  }
}

export interface ArmoireResult {
  armoire: {
    type: string
    dropText: string
    value: number
  }
}
