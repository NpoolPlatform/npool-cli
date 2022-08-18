import { defineStore } from 'pinia'
import { doGet, doGetWithError } from '../../action'
import { Coin, useCoinStore } from '../coins'
import { NotificationType } from '../../local/notifications'
import { CoinbaseAPI, CoinGeckoAPI, CoinType, COIN_PATTERN, Currency, CURRENCY_PATTERN } from './const'
import { CurrencyState, GetCoinCurrencyRequest, GetCoinCurrencyResponse, GetCoinsCurrenciesRequest } from './types'
import { useI18n } from 'vue-i18n'

export const useCurrencyStore = defineStore('currency', {
  state: (): CurrencyState => ({
    Currencies: new Map<string, Map<string, number>>(),
    I18n: useI18n()
  }),
  getters: {
    getExchangeCoinName (): (coin: Coin) => string {
      return (coin: Coin) => {
        if (coin.Name?.startsWith('usdt') || coin.Name?.startsWith('tusdt')) {
          return CoinType.USDTERC20
        }
        if (coin.Name?.toLowerCase().includes('binancecoin')) {
          return 'binance-coin'
        }
        return coin.Name?.replaceAll(/^t/g, '').toLowerCase() as string
      }
    },
    getCachedCoinCurrencyByCoinName (): (coinName: string, currency: Currency) => number {
      return (coinName: string, currency: Currency) => {
        if ((coinName.toLowerCase().includes('usd') ||
            coinName.toLowerCase().includes('usdt') ||
            coinName.toLowerCase().includes('tether') ||
            coinName.toLowerCase().includes('binance usd') ||
            coinName.toLowerCase().includes('usdbep20') ||
            coinName.toLowerCase().includes('usd coin')) &&
            currency === Currency.USD) {
          return 1
        }

        const amount = this.Currencies.get(coinName)?.get(currency)
        if (amount !== undefined) {
          return amount
        }
        return undefined as unknown as number
      }
    },
    formatCoinName (): (name: string) => string {
      return (name: string) => {
        const coin = useCoinStore()
        return coin.formatCoinName(name)
      }
    }
  },
  actions: {
    getCurrency (req: GetCoinCurrencyRequest, coinName: string, done: (amount: number) => void) {
      if ((coinName.toLowerCase().includes('usd') || (coinName.toLowerCase().includes('usdt') || coinName.toLowerCase().includes('tether')) && req.Currency === Currency.USD) {
        done(1)
        return
      }

      let url = CoinbaseAPI.GET_COIN_CURRENCY
      if (coinName.includes('bitcoin')) {
        url = url.replace(COIN_PATTERN, 'BTC') as CoinbaseAPI
      } else if (coinName.includes('ethereum')) {
        url = url.replace(COIN_PATTERN, 'ETH') as CoinbaseAPI
      } else if (coinName.includes('filecoin')) {
        url = url.replace(COIN_PATTERN, 'FIL') as CoinbaseAPI
      } else if (coinName.includes('tether') || coinName.includes('usdt')) {
        url = url.replace(COIN_PATTERN, 'USDT') as CoinbaseAPI
      } else if (coinName.includes('solana')) {
        url = url.replace(COIN_PATTERN, 'SOL') as CoinbaseAPI
      } else {
        console.log('UNSUPPORTED coin type', coinName)
        return
      }

      url = url.replace(CURRENCY_PATTERN, req.Currency.toUpperCase()) as CoinbaseAPI

      doGet<GetCoinCurrencyRequest, GetCoinCurrencyResponse>(
        url,
        req,
        req.Message,
        (resp: GetCoinCurrencyResponse): void => {
          let myAmounts = this.Currencies.get(req.Currency)
          if (!myAmounts) {
            myAmounts = new Map<string, number>()
          }
          const amount = parseFloat(resp.data.amount)
          myAmounts.set(req.Currency, amount)
          this.Currencies.set(req.Currency, myAmounts)
          done(amount)
        })
    },
    getCoinCurrencies (req: GetCoinsCurrenciesRequest, coinNames: Array<string>, done: (error: boolean) => void) {
      const ids = coinNames.join(',')
      const url = CoinGeckoAPI.GET_COINS_CURRENCIES + '?ids=' + ids + '&vs_currencies=' + req.Currencies.join(',')
      doGetWithError<GetCoinsCurrenciesRequest, Map<string, Map<string, number>>>(
        url,
        req,
        req.Message,
        (resp: Map<string, Map<string, number>>): void => {
          for (const [coin, map] of Object.entries(resp)) {
            let myAmounts = this.Currencies.get(coin)
            if (!myAmounts) {
              myAmounts = new Map<string, number>()
            }
            for (const [currency, amount] of Object.entries(map)) {
              myAmounts.set(currency, amount as number)
            }
            this.Currencies.set(coin, myAmounts)
          }
          done(false)
        }, () => {
          done(true)
        })
    },
    getAllCoinCurrencies (req: GetCoinsCurrenciesRequest, done: () => void) {
      const coins = new Map<string, string>()
      const coin = useCoinStore()
      coin.Coins.forEach((coin: Coin) => {
        coins.set(this.getExchangeCoinName(coin), coin.Name as string)
      })
      const ids = Array.from(coins).map(([key, ]) => key)
      this.getCoinCurrencies(req, ids, (error: boolean) => {
        if (!error) {
          done()
          return
        }
      })
    },
    getCoinCurrencyByCoinName (coinName: string, currency: Currency, done: (currency: number) => void) {
      const amount = this.getCachedCoinCurrencyByCoinName(coinName, currency)
      if (amount !== undefined) {
        done(amount)
        return
      }

      this.getCoinCurrencies({
        Currencies: [currency],
        Message: {
          Error: {
            Title: this.I18n.t('MSG_GET_CURRENCIES'),
            Message: this.I18n.t('MSG_GET_CURRENCIES_FAIL'),
            Popup: true,
            Type: NotificationType.Error
          }
        }
      }, [coinName], (error: boolean) => {
        if (!error) {
          const amount = this.getCachedCoinCurrencyByCoinName(coinName, currency)
          if (amount !== undefined) {
            done(amount)
            return
          }
        }

        this.getCurrency({
          Currency: currency,
          Message: {
            Error: {
              Title: this.I18n.t('MSG_GET_CURRENCY'),
              Message: this.I18n.t('MSG_GET_CURRENCY_FAIL'),
              Popup: true,
              Type: NotificationType.Error
            }
          }
        }, coinName, (amount: number) => {
          done(amount)
        })
      })
    },
    getCoinCurrency (coin: Coin, currency: Currency, done: (currency: number) => void) {
      this.getCoinCurrencyByCoinName(this.getExchangeCoinName(coin), currency, done)
    },
    getUSDTCurrency (currency: Currency, done: (currency: number) => void) {
      this.getCoinCurrencyByCoinName(CoinType.USDTERC20, currency, done)
    },
    getCoinNameCurrency (coinName: string, currency: Currency, done: (currency: number) => void) {
      this.getCoinCurrencyByCoinName(coinName, currency, done)
    }
  }
})

export * from './types'
export { Currency, CoinType, PriceCoinName } from './const'
