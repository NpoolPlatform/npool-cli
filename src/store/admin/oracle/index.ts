import { defineStore } from 'pinia'
import { doAction, doActionWithError } from '../../action'
import { API } from './const'
import { OracleState } from './state'
import {
  CreateCurrencyRequest,
  CreateCurrencyResponse,
  GetCurrenciesRequest,
  GetCurrenciesResponse,
  UpdateCurrencyRequest,
  UpdateCurrencyResponse
} from './types'

export const useAdminOracleStore = defineStore('adminoracle', {
  state: (): OracleState => ({
    Currencies: []
  }),
  getters: {
    getCurrencyByID () {
      return (coinTypeID: string) => {
        return this.Currencies.find((el) => el.CoinTypeID === coinTypeID)
      }
    }
  },
  actions: {
    createCurrency (req: CreateCurrencyRequest, done: () => void) {
      doAction<CreateCurrencyRequest, CreateCurrencyResponse>(
        API.CREATE_CURRENCY,
        req,
        req.Message,
        (resp: CreateCurrencyResponse): void => {
          this.Currencies.splice(0, 0, resp.Info)
          done()
        })
    },
    updateCurrency (req: UpdateCurrencyRequest, done: () => void) {
      doAction<UpdateCurrencyRequest, UpdateCurrencyResponse>(
        API.UPDATE_CURRENCY,
        req,
        req.Message,
        (resp: UpdateCurrencyResponse): void => {
          const index = this.Currencies.findIndex((el) => el.ID === resp.Info.ID)
          this.Currencies.splice(index < 0 ? 0 : index, index < 0 ? 0 : 1, resp.Info)
          done()
        })
    },
    getCurrencies (req: GetCurrenciesRequest, done: (error: boolean) => void) {
      doActionWithError<GetCurrenciesRequest, GetCurrenciesResponse>(
        API.GET_CURRENCIES,
        req,
        req.Message,
        (resp: GetCurrenciesResponse): void => {
          this.Currencies = resp.Infos
          done(false)
        }, () => {
          done(true)
        })
    }
  }
})

export * from './types'
export { CurrencyMethod, CurrencyMethods } from './const'
