import Habitica from '../habitica'

jest.mock('../config', () => ({
  manaThresholds: {
    earthquake: 150,
  },
  goldThresholds: {
    armoire: 500,
  },
  healthThresholds: {
    health: 25,
  },
  user: {
    id: '1234',
    key: 'key',
  },
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

const setup = (data) => {
  UrlFetchApp.fetch.mockImplementationOnce(() => ({
    getContentText: jest.fn(() =>
      JSON.stringify({
        data,
      })
    ),
  }))

  return new Habitica()
}

describe('#buyArmoire', () => {
  test('buy if gold is above threshold, get food', () => {
    const habitica = setup({
      stats: {
        gp: 600,
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
      stats: {
        gp: 600,
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
      stats: {
        gp: 400,
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
      stats: {
        mp: 160,
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
        headers: { 'x-api-user': '1234', 'x-api-key': 'key' },
      }
    )
    expect(Logger.log).toHaveBeenCalledWith('Casting *earthquake*')
  })

  test('does not cast if mana is below threshold', () => {
    const habitica = setup({
      stats: {
        mp: 149,
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
      'https://habitica.com/api/v3/user/hatch/PandaCub/Red',
      {
        method: 'post',
        headers: { 'x-api-user': '1234', 'x-api-key': 'key' },
      }
    )
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
      'https://habitica.com/api/v3/user/hatch/FlyingPig/Skeleton',
      {
        method: 'post',
        headers: { 'x-api-user': '1234', 'x-api-key': 'key' },
      }
    )

    expect(Logger.log).toHaveBeenCalledWith('Hatching Red PandaCub')
    expect(Logger.log).toHaveBeenCalledWith('Hatching Skeleton FlyingPig')
  })

  test('hatches nothing if no eggs', () => {
    const habitica = setup({
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
    })

    habitica.hatchPets()

    expect(Logger.log).toHaveBeenCalledWith('All out of eggs')
  })

  test('hatches nothing if no potions', () => {
    const habitica = setup({
      items: {
        eggs: {
          PandaCub: 1,
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
          Skeleton: 0,
          Shade: 0,
          Red: 0,
          CottonCandyPink: 0,
          RoyalPurple: 0,
          CottonCandyBlue: 0,
          BlackPearl: 0,
          Desert: 0,
          Golden: 0,
          Base: 0,
          Zombie: 0,
          White: 0,
        },
      },
    })

    habitica.hatchPets()

    expect(Logger.log).toHaveBeenCalledWith('All out of potions')
  })
})

describe('#feedPets', () => {
  test('does not feed pets if no food is available', () => {
    const habitica = setup({
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
    })

    habitica.feedPets()

    expect(Logger.log).toHaveBeenCalledWith('All out of food')
  })

  test('feeds pets with available food', () => {
    const habitica = setup({
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
    })

    UrlFetchApp.fetch.mockImplementationOnce(() => ({
      getContentText: jest.fn().mockReturnValue('{ "success": true }'),
    }))
    UrlFetchApp.fetch.mockImplementationOnce(() => ({
      getContentText: jest.fn().mockReturnValue('{ "success": true }'),
    }))

    habitica.feedPets()

    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
      'https://habitica.com/api/v3/user/feed/FlyingPig-Base/Meat',
      {
        method: 'post',
        headers: { 'x-api-user': '1234', 'x-api-key': 'key' },
      }
    )
    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
      'https://habitica.com/api/v3/user/feed/PandaCub-Skeleton/Fish',
      {
        method: 'post',
        headers: { 'x-api-user': '1234', 'x-api-key': 'key' },
      }
    )

    expect(Logger.log).toHaveBeenCalledWith('Feeding Meat to FlyingPig-Base')
    expect(Logger.log).toHaveBeenCalledWith('Feeding Fish to PandaCub-Skeleton')
  })
})

describe('#joinQuest', () => {
  test('no quest', () => {
    const habitica = setup({ quest: {} })

    habitica.joinQuest()

    expect(Logger.log).toHaveBeenCalledWith('No current quest')
  })

  test('quest has already been started', () => {
    const habitica = setup({ quest: { key: 'id', active: true } })

    habitica.joinQuest()

    expect(Logger.log).toHaveBeenCalledWith('Quest has already started')
  })

  test('you have already joined the quest', () => {
    const habitica = setup({
      quest: {
        key: 'id',
        active: false,
        members: {
          1234: true,
        },
      },
    })

    habitica.joinQuest()

    expect(Logger.log).toHaveBeenCalledWith('You have already joined the quest')
  })

  test('join quest', () => {
    const habitica = setup({
      quest: {
        key: 'id',
        active: false,
        members: {
          1234: null,
        },
      },
    })

    UrlFetchApp.fetch.mockImplementationOnce(() => ({
      getContentText: jest.fn().mockReturnValue('{ "success": true }'),
    }))

    habitica.joinQuest()

    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
      'https://habitica.com/api/v3/groups/party/quests/accept',
      {
        method: 'post',
        headers: { 'x-api-user': '1234', 'x-api-key': 'key' },
      }
    )
    expect(Logger.log).toHaveBeenCalledWith(
      'You have joined the quest! Happy hunting'
    )
  })
})

describe('#healthPotion', () => {
  test('does not buy a health potion if health is above threshold', () => {
    const habitica = setup({
      stats: {
        hp: 50,
      },
    })

    habitica.healthPotion()

    expect(Logger.log).toHaveBeenCalledWith('You are healthy enough')
  })

  test('does not buy a health potion if not enough gold', () => {
    const habitica = setup({
      stats: {
        hp: 20,
        gp: 20,
      },
    })

    habitica.healthPotion()

    expect(Logger.log).toHaveBeenCalledWith(
      'Not enough gold to buy a health potion'
    )
  })

  test('buys a health pot if health is below threshold', () => {
    const habitica = setup({
      stats: {
        hp: 20,
      },
    })

    UrlFetchApp.fetch.mockImplementationOnce(() => ({
      getContentText: jest.fn().mockReturnValue('{ "success": true }'),
    }))

    habitica.healthPotion()

    expect(UrlFetchApp.fetch).toHaveBeenCalledWith(
      'https://habitica.com/api/v3/user/buy-health-potion',
      {
        method: 'post',
        headers: { 'x-api-user': '1234', 'x-api-key': 'key' },
      }
    )
    expect(Logger.log).toHaveBeenCalledWith(
      'You are healed up. Current hp = 35'
    )
  })
})
