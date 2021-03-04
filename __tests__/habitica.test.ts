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
