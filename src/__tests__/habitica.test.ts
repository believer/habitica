import Habitica from '../habitica'

jest.mock('../config', () => ({
  manaThresholds: {
    earthquake: 150,
  },
  goldThresholds: {
    armoire: 500,
  },
  headers: 'headers',
}))

let UrlFetchApp: any
let Logger: any

beforeEach(() => {
  UrlFetchApp = {
    fetch: jest.fn(),
  }

  Logger = {
    log: jest.fn(),
  }

  global.UrlFetchApp = UrlFetchApp
  global.Logger = Logger
})

const setup = ({ user }) => {
  UrlFetchApp.fetch.mockImplementationOnce(() => ({
    getContentText: jest.fn(() =>
      JSON.stringify({
        data: user,
      })
    ),
  }))

  return new Habitica()
}

describe('#buyArmoire', () => {
  test('buy if gold is above threshold, get food', () => {
    const habitica = setup({
      user: {
        stats: {
          gp: 600,
        },
      },
    })

    UrlFetchApp.fetch.mockImplementationOnce(() => ({
      getContentText: jest.fn(() =>
        JSON.stringify({
          data: {
            armoire: {
              type: 'food',
              dropText: 'fish',
            },
          },
        })
      ),
    }))

    habitica.buyArmoire()

    expect(Logger.log).toHaveBeenCalledWith('You gained fish')
  })

  test('buy if gold is above threshold, get item', () => {
    const habitica = setup({
      user: {
        stats: {
          gp: 600,
        },
      },
    })

    UrlFetchApp.fetch.mockImplementationOnce(() => ({
      getContentText: jest.fn(() =>
        JSON.stringify({
          data: {
            armoire: {
              type: 'sword',
              dropText: 'fish',
              value: 1,
            },
          },
        })
      ),
    }))

    habitica.buyArmoire()

    expect(Logger.log).toHaveBeenCalledWith('You gained 1 sword')
  })

  test('buys nothing if gold is below threshold', () => {
    const habitica = setup({
      user: {
        stats: {
          gp: 400,
        },
      },
    })

    habitica.buyArmoire()

    expect(Logger.log).toHaveBeenCalledWith(
      'Wallet contains 400 coins. Threshold = 500'
    )
  })
})

describe('#earthquake', () => {
  test('cast if mana is above threshold', () => {
    const habitica = setup({
      user: {
        stats: {
          mp: 160,
        },
      },
    })

    // Cast quake
    UrlFetchApp.fetch.mockImplementationOnce(() => ({
      getContentText: jest.fn().mockReturnValue('{ "success": true }'),
    }))

    habitica.earthquake()

    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
      'https://habitica.com/api/v3/user/class/cast/earth',
      {
        method: 'post',
        headers: 'headers',
      }
    )
    expect(Logger.log).toHaveBeenCalledWith('Casting *earthquake*')
  })

  test('does not cast if mana is below threshold', () => {
    const habitica = setup({
      user: {
        stats: {
          mp: 149,
        },
      },
    })

    // Cast quake
    UrlFetchApp.fetch.mockImplementationOnce(() => ({
      getContentText: jest.fn().mockReturnValue('{ "success": true }'),
    }))

    habitica.earthquake()

    expect(Logger.log).toHaveBeenCalledWith('Mana is at 149. Threshold = 150')
  })
})

describe('#hatchPets', () => {
  test('hatches any available eggs', () => {
    const habitica = setup({
      user: {
        items: {
          eggs: {
            PandaCub: 1,
            BearCub: 0,
            Wolf: 0,
            Cactus: 0,
            Dragon: 0,
            TigerCub: 0,
            FlyingPig: 1,
            Fox: 0,
            LionCub: 0,
            SeaSerpent: 0,
          },
          hatchingPotions: {
            Skeleton: 1,
            Shade: 0,
            Red: 1,
            CottonCandyPink: 0,
            RoyalPurple: 0,
            CottonCandyBlue: 0,
            BlackPearl: 0,
            Desert: 1,
            Golden: 0,
            Base: 4,
            Zombie: 1,
            White: 1,
          },
        },
      },
    })

    UrlFetchApp.fetch.mockImplementationOnce(() => ({
      getContentText: jest.fn().mockReturnValue('{ "success": true }'),
    }))
    UrlFetchApp.fetch.mockImplementationOnce(() => ({
      getContentText: jest.fn().mockReturnValue('{ "success": true }'),
    }))

    habitica.hatchPets()

    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
      'https://habitica.com/api/v3/user/hatch/PandaCub/Skeleton',
      {
        method: 'post',
        headers: 'headers',
      }
    )
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
      'https://habitica.com/api/v3/user/hatch/FlyingPig/Red',
      {
        method: 'post',
        headers: 'headers',
      }
    )

    expect(Logger.log).toHaveBeenCalledWith('Hatching Skeleton PandaCub')
    expect(Logger.log).toHaveBeenCalledWith('Hatching Red FlyingPig')
  })

  test('hatches nothing if no eggs', () => {
    const habitica = setup({
      user: {
        items: {
          eggs: {
            PandaCub: 0,
            BearCub: 0,
            Wolf: 0,
            Cactus: 0,
            Dragon: 0,
            TigerCub: 0,
            FlyingPig: 0,
            Fox: 0,
            LionCub: 0,
            SeaSerpent: 0,
          },
          hatchingPotions: {
            Skeleton: 1,
            Shade: 0,
            Red: 1,
            CottonCandyPink: 0,
            RoyalPurple: 0,
            CottonCandyBlue: 0,
            BlackPearl: 0,
            Desert: 1,
            Golden: 0,
            Base: 4,
            Zombie: 1,
            White: 1,
          },
        },
      },
    })

    habitica.hatchPets()

    expect(Logger.log).toHaveBeenCalledWith('All out of eggs')
  })
})

describe('#feedPets', () => {
  test('does not feed pets if no food is available', () => {
    const habitica = setup({
      user: {
        items: {
          pets: {
            'PandaCub-Skeleton': 27,
            'BearCub-Shade': 5,
            'Jackalope-RoyalPurple': 5,
            'Phoenix-Base': 5,
            'Wolf-Red': 30,
            'PandaCub-CottonCandyPink': 40,
            'BearCub-Skeleton': 5,
            'PandaCub-Shade': 30,
            'Cactus-CottonCandyBlue': 15,
            'Dragon-Skeleton': 5,
            'Dragon-Shade': 5,
            'Cactus-CottonCandyPink': 5,
            'Dragon-Red': 5,
            'PandaCub-CottonCandyBlue': 15,
            'TigerCub-Golden': 20,
            'FlyingPig-Base': 20,
            'Fox-Desert': 15,
            'TigerCub-Red': 5,
            'Cactus-Shade': 5,
            'LionCub-BlackPearl': 5,
            'FlyingPig-RoyalPurple': 5,
            'PandaCub-BlackPearl': 5,
            'LionCub-RoyalPurple': 5,
            'LionCub-Zombie': 25,
            'Fox-White': 15,
            'Dragon-BlackPearl': 5,
            'SeaSerpent-Golden': 5,
            'SeaSerpent-Red': 5,
            'SeaSerpent-Shade': 5,
          },
          food: {
            Chocolate: 0,
            CottonCandyPink: 0,
            Strawberry: 0,
            Fish: 0,
            Honey: 0,
            Meat: 0,
            CottonCandyBlue: 0,
            RottenMeat: 0,
            Potatoe: 0,
            Milk: 0,
          },
        },
      },
    })

    habitica.feedPets()

    expect(Logger.log).toHaveBeenCalledWith('All out of food')
  })

  test('feeds pets with available food', () => {
    const habitica = setup({
      user: {
        items: {
          pets: {
            'PandaCub-Skeleton': 27,
            'BearCub-Shade': 5,
            'Jackalope-RoyalPurple': 5,
            'Phoenix-Base': 5,
            'Wolf-Red': 30,
            'PandaCub-CottonCandyPink': 40,
            'BearCub-Skeleton': 5,
            'PandaCub-Shade': 30,
            'Cactus-CottonCandyBlue': 15,
            'Dragon-Skeleton': 5,
            'Dragon-Shade': 5,
            'Cactus-CottonCandyPink': 5,
            'Dragon-Red': 5,
            'PandaCub-CottonCandyBlue': 15,
            'TigerCub-Golden': 20,
            'FlyingPig-Base': 20,
            'Fox-Desert': 15,
            'TigerCub-Red': 5,
            'Cactus-Shade': 5,
            'LionCub-BlackPearl': 5,
            'FlyingPig-RoyalPurple': 5,
            'PandaCub-BlackPearl': 5,
            'LionCub-RoyalPurple': 5,
            'LionCub-Zombie': 25,
            'Fox-White': 15,
            'Dragon-BlackPearl': 5,
            'SeaSerpent-Golden': 5,
            'SeaSerpent-Red': 5,
            'SeaSerpent-Shade': 5,
          },
          food: {
            Chocolate: 0,
            CottonCandyPink: 0,
            Strawberry: 0,
            Fish: 1,
            Honey: 0,
            Meat: 2,
            CottonCandyBlue: 0,
            RottenMeat: 0,
            Potatoe: 0,
            Milk: 0,
          },
        },
      },
    })

    UrlFetchApp.fetch.mockImplementationOnce(() => ({
      getContentText: jest.fn().mockReturnValue('{ "success": true }'),
    }))
    UrlFetchApp.fetch.mockImplementationOnce(() => ({
      getContentText: jest.fn().mockReturnValue('{ "success": true }'),
    }))

    habitica.feedPets()

    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
      'https://habitica.com/api/v3/user/feed/Phoenix-Base/Meat',
      {
        method: 'post',
        headers: 'headers',
      }
    )
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
      'https://habitica.com/api/v3/user/feed/PandaCub-Skeleton/Fish',
      {
        method: 'post',
        headers: 'headers',
      }
    )

    expect(Logger.log).toHaveBeenCalledWith('Feeding Meat to Phoenix-Base')
    expect(Logger.log).toHaveBeenCalledWith('Feeding Fish to PandaCub-Skeleton')
  })
})
