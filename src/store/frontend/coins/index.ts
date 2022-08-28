import { defineStore } from 'pinia'
import { NotSet } from '../../../const'
import { doAction, doActionWithError } from '../../action'
import { API, DefaultCoinPageSize } from './const'
import {
  Coin,
  CoinState,
  Description,
  GetCoinsRequest,
  GetCoinsResponse,
  GetCurrentFeeRequest,
  GetCurrentFeeResponse,
  GetDescriptionsRequest,
  GetDescriptionsResponse,
  GetProductInfosRequest,
  GetProductInfosResponse,
  ProductInfo
} from './types'

export const useCoinStore = defineStore('coin', {
  state: (): CoinState => ({
    Coins: [],
    Descriptions: new Map<string, Map<string, Description>>(),
    ProductInfos: new Map<string, ProductInfo>(),
    Currencies: new Map<string, Map<string, number>>()
  }),
  getters: {
    getCoinLogo (): (coin: Coin) => string {
      return (coin: Coin): string => {
        if (coin && coin.Logo.length > 0 && coin.Logo !== NotSet) {
          return coin.Logo
        }
        return 'icons/Logo.svg'
      }
    },
    getCoinByID (): (id: string) => Coin {
      return (id: string): Coin => {
        for (const coin of this.Coins) {
          if (id === coin.ID) {
            return coin
          }
        }
        return undefined as unknown as Coin
      }
    },
    getCoinDescriptionByCoinUsedFor (): (id: string, usedFor: string) => Description {
      return (id: string, usedFor: string): Description => {
        const descriptions = this.Descriptions.get(id)
        if (!descriptions) {
          return undefined as unknown as Description
        }
        return descriptions.get(usedFor) as Description
      }
    },
    getCoinProductInfoByCoin (): (coinID: string) => ProductInfo {
      return (coinID: string) => {
        return this.ProductInfos.get(coinID) as ProductInfo
      }
    },
    formatCoinName (): (name: string) => string {
      return (name: string) => {
        if (name.includes('tusdcerc20')) {
          name = name.replace('tusedcerc20', 'TUSD Coin ERC20')
        }
        if (name.includes('usdcerc20')) {
          name = name.replace('usdcerc20', 'USD Coin ERC20')
        }
        if (name.includes('usdt')) {
          name = name.replace('usdt', 'USDT')
        }
        if (!name.includes('USDT ')) {
          name = name.replace('USDT', 'USDT ')
        }
        if (name.includes('erc')) {
          name = name.replace('erc', 'ERC')
        }
        if (name.includes('trc')) {
          name = name.replace('trc', 'TRC')
        }
        if (name.includes('usd')) {
          name = name.replace('usd', 'USD')
        }
        if (name.indexOf('USD') > 0 && !name.includes(' USD') && !name.toUpperCase().includes('TUSD')) {
          name = name.replace('USD', ' USD')
        }
        if (name.includes('Binance USD')) {
          name = name.replace('Binance USD', 'BEP20')
        }
        if (name.includes('USDT')) {
          name = name.replace('USDT', 'Tether')
        }
        name = name[0].toUpperCase() + name.slice(1)
        return name
      }
    }
  },
  actions: {
    getCoins (req: GetCoinsRequest, done: () => void) {
      req.Limit = DefaultCoinPageSize
      doAction<GetCoinsRequest, GetCoinsResponse>(
        API.GET_COINS,
        req,
        req.Message,
        (resp: GetCoinsResponse): void => {
          this.Coins = resp.Infos.sort((a: Coin, b: Coin) => {
            return (a.Name as string) < (b.Name as string) ? -1 : 1
          })
          const coins = [] as Array<Coin>
          this.Coins.forEach((coin) => {
            coin.Name = this.formatCoinName(coin.Name as string)
            coins.push(coin)
          })
          this.Coins = coins
          done()
        })
    },
    getCoinDescriptions (req: GetDescriptionsRequest, done?: () => void) {
      doAction<GetDescriptionsRequest, GetDescriptionsResponse>(
        API.GET_DESCRIPTIONS,
        req,
        req.Message,
        (resp: GetDescriptionsResponse): void => {
          resp.Infos.forEach((desc) => {
            let descriptions = this.Descriptions.get(desc.CoinTypeID) as Map<string, Description>
            if (!descriptions) {
              descriptions = new Map<string, Description>()
            }
            descriptions.set(desc.UsedFor, desc)
            this.Descriptions.set(desc.CoinTypeID, descriptions)
          })
          done?.()
        })
    },
    getCoinProductInfos (req: GetProductInfosRequest, done?: () => void) {
      doAction<GetProductInfosRequest, GetProductInfosResponse>(
        API.GET_PRODUCT_INFOS,
        req,
        req.Message,
        (resp: GetProductInfosResponse): void => {
          resp.Infos.forEach((info) => {
            this.ProductInfos.set(info.CoinTypeID, info)
          })
          done?.()
        })
    },
    getCurrentFee (req: GetCurrentFeeRequest, done: (feeAmount: number, error: boolean) => void) {
      doActionWithError<GetCurrentFeeRequest, GetCurrentFeeResponse>(
        API.GET_CURRENT_FEE,
        req,
        req.Message,
        (resp: GetCurrentFeeResponse): void => {
          done(resp.FeeAmount, false)
        }, () => {
          done(0, true)
        })
    }
  }
})

export * from './types'
export { CoinDescriptionUsedFors, CoinDescriptionUsedFor, CoinEnvironments, CoinEnvironment } from './const'
