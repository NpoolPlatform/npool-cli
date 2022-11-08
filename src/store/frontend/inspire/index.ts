import { defineStore } from 'pinia'
import { doAction, doActionWithError } from '../../action'
import { API } from './const'
import {
  CreateSubInvitationCodeRequest,
  CreateSubInvitationCodeResponse,
  CreateSubPurchaseAmountSettingRequest,
  CreateSubPurchaseAmountSettingResponse,
  GetGoodCommissionsRequest,
  GetGoodCommissionsResponse,
  GetInvitationCodeRequest,
  GetInvitationCodeResponse,
  GetPurchaseAmountSettingsRequest,
  GetPurchaseAmountSettingsResponse,
  GetReferralsRequest,
  GetReferralsResponse,
  InspireState,
  InvitationCode,
  PurchaseAmountSetting,
  UpdateInvitationCodeRequest,
  UpdateInvitationCodeResponse
} from './types'

export const useInspireStore = defineStore('inspire', {
  state: (): InspireState => ({
    InvitationCode: {} as InvitationCode,
    Referrals: [],
    GoodCommissions: [],
    PurchaseAmountSettings: []
  }),
  getters: {},
  actions: {
    getInvitationCode (req: GetInvitationCodeRequest, done?: () => void) {
      doAction<GetInvitationCodeRequest, GetInvitationCodeResponse>(
        API.GET_INVITATION_CODE,
        req,
        req.Message,
        (resp: GetInvitationCodeResponse): void => {
          this.InvitationCode = resp.Info
          done?.()
        })
    },
    createInvitationCode (req: CreateSubInvitationCodeRequest, done: (error: boolean) => void) {
      doActionWithError<CreateSubInvitationCodeRequest, CreateSubInvitationCodeResponse>(
        API.CREATE_INVITATION_CODE,
        req,
        req.Message,
        (): void => {
          done(false)
        }, () => {
          done(true)
        })
    },
    updateInvitationCode (req: UpdateInvitationCodeRequest, done: () => void) {
      doAction<UpdateInvitationCodeRequest, UpdateInvitationCodeResponse>(
        API.UPDATE_INVITATION_CODE,
        req,
        req.Message,
        (resp: UpdateInvitationCodeResponse): void => {
          this.InvitationCode = resp.Info
          done()
        })
    },
    getReferrals (req: GetReferralsRequest, done: (error: boolean) => void) {
      doActionWithError<GetReferralsRequest, GetReferralsResponse>(
        API.GET_REFERRALS,
        req,
        req.Message,
        (resp: GetReferralsResponse): void => {
          this.Referrals = resp.Infos
          done(false)
        }, () => {
          done(true)
        })
    },
    getGoodCommissions (req: GetGoodCommissionsRequest, done: (error: boolean) => void) {
      doActionWithError<GetGoodCommissionsRequest, GetGoodCommissionsResponse>(
        API.GET_GOOD_COMMISSIONS,
        req,
        req.Message,
        (resp: GetGoodCommissionsResponse): void => {
          this.GoodCommissions = resp.Infos
          done(false)
        }, () => {
          done(true)
        })
    },
    getPurchaseAmountSettings (req: GetPurchaseAmountSettingsRequest, done: (error: boolean) => void) {
      doActionWithError<GetPurchaseAmountSettingsRequest, GetPurchaseAmountSettingsResponse>(
        API.GET_AMOUNT_SETTINGS,
        req,
        req.Message,
        (resp: GetPurchaseAmountSettingsResponse): void => {
          resp.Infos.forEach((info: PurchaseAmountSetting) => {
            const index = this.PurchaseAmountSettings.findIndex((el) => el.ID === info.ID)
            this.PurchaseAmountSettings.splice(index < 0 ? 0 : index, index < 0 ? 0 : 1, info)
          })
          done(false)
        }, () => {
          done(true)
        })
    },
    createPurchaseAmountSetting (req: CreateSubPurchaseAmountSettingRequest, done: () => void) {
      doAction<CreateSubPurchaseAmountSettingRequest, CreateSubPurchaseAmountSettingResponse>(
        API.CREATE_AMOUNT_SETTING,
        req,
        req.Message,
        (resp: CreateSubPurchaseAmountSettingResponse): void => {
          resp.Infos.forEach((info: PurchaseAmountSetting) => {
            const index = this.PurchaseAmountSettings.findIndex((el) => el.ID === info.ID)
            this.PurchaseAmountSettings.splice(index < 0 ? 0 : index, index < 0 ? 0 : 1, info)
          })
          done()
        })
    }
  }
})

export * from './types'
