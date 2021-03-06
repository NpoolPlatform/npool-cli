import { defineStore } from 'pinia'
import { InvalidID } from '../../../const'
import { remain } from '../../../utils/timer'
import { doAction, doActionWithError } from '../../action'
import { useCoinStore } from '../coins'
import { API, OrderTimeoutSeconds, PaymentState } from './const'
import {
  CreatePaymentRequest,
  CreatePaymentResponse,
  GetBaseOrdersRequest,
  GetBaseOrdersResponse,
  GetOrderRequest,
  GetOrderResponse,
  GetOrdersRequest,
  GetOrdersResponse,
  Order,
  OrderState,
  Payment,
  SubmitOrderRequest,
  SubmitOrderResponse,
  UpdatePaymentRequest,
  UpdatePaymentResponse
} from './types'

export const useOrderStore = defineStore('order', {
  state: (): OrderState => ({
    Orders: [],
    BaseOrders: []
  }),
  getters: {
    getOrderByID (): (id: string) => Order {
      return (id: string): Order => {
        for (const order of this.Orders) {
          if (order.Order.Order.ID === id) {
            return order
          }
        }
        return undefined as unknown as Order
      }
    },

    getOrdersByCoin (): (coinTypeID: string) => Array<Order> {
      return (coinTypeID: string): Array<Order> => {
        return this.Orders.filter((order: Order) => coinTypeID === order.Good.Main?.ID)
      }
    },

    getOrderState (): (order: Order) => string {
      return (order: Order): string => {
        if (!order) {
          return 'MSG_ERROR'
        }

        const now = new Date().getTime() / 1000
        if (!order.Order.Payment) {
          return 'MSG_INVALID_PAYMENT'
        }
        if (order.Order.Payment && order.Order.Payment.State === PaymentState.TIMEOUT) {
          return 'MSG_CANCELED_BY_TIMEOUT'
        }
        if (order.Order.Payment && order.Order.Payment.State === PaymentState.WAIT && now < order.Order.Order.CreateAt + OrderTimeoutSeconds) {
          return remain(order.Order.Order.CreateAt + OrderTimeoutSeconds)
        }
        if (order.Order.Payment && order.Order.Payment.State === PaymentState.FAIL) {
          return 'MSG_PAYMENT_FAIL'
        }
        if (order.Order.Payment && order.Order.Payment.State === PaymentState.CANCELED) {
          return 'MSG_PAYMENT_CANCELED'
        }
        if (now < order.Order.Order.Start) {
          return 'MSG_WAIT_FOR_START'
        }
        if (order.Order.Order.End < now) {
          return 'MSG_DONE'
        }
        return 'MSG_IN_SERVICE'
      }
    },

    validateOrder (): (order: Order) => boolean {
      return (order: Order): boolean => {
        if (!order) {
          return false
        }

        const now = new Date().getTime() / 1000
        if (!order.Order.Payment) {
          return false
        }
        if (order.Order.Payment && order.Order.Payment.State === PaymentState.TIMEOUT) {
          return false
        }
        if (order.Order.Payment && order.Order.Payment.State === PaymentState.WAIT && now < order.Order.Order.CreateAt + OrderTimeoutSeconds) {
          return true
        }
        if (order.Order.Payment && order.Order.Payment.State === PaymentState.FAIL) {
          return false
        }
        return true
      }
    },

    orderPaid (): (order: Order) => boolean {
      return (order: Order) => {
        return order.Order.Payment ? order.Order.Payment.State === 'done' : false
      }
    },

    getPaymentByID (): (id: string) => Payment {
      return (id: string) => {
        const index = this.Orders.findIndex((el) => el.Order.Payment && el.Order.Payment.ID === id)
        return index >= 0 ? this.Orders[index].Order.Payment : undefined as unknown as Payment
      }
    }
  },
  actions: {
    insertOrder (order: Order) {
      const index = this.Orders.findIndex((el) => el.Order.Order.ID === order.Order.Order.ID)
      if (order.PayWithCoin) {
        const coin = useCoinStore()
        order.PayWithCoin.Name = coin.formatCoinName(order.PayWithCoin.Name as string)
      }
      this.Orders.splice(index < 0 ? 0 : index, index < 0 ? 0 : 1, order)
    },

    submitOrder (req: SubmitOrderRequest, handler: (orderID: string, error: boolean) => void) {
      doActionWithError<SubmitOrderRequest, SubmitOrderResponse>(
        API.SUBMIT_ORDER,
        req,
        req.Message,
        (resp: SubmitOrderResponse): void => {
          this.insertOrder(resp.Info)
          handler(resp.Info.Order.Order.ID, false)
        }, () => {
          handler(InvalidID, true)
        })
    },

    getOrder (req: GetOrderRequest, done: () => void) {
      doAction<GetOrderRequest, GetOrderResponse>(
        API.GET_ORDER,
        req,
        req.Message,
        (resp: GetOrderResponse): void => {
          this.insertOrder(resp.Info)
          done()
        })
    },

    createPayment (req: CreatePaymentRequest, handler: (paymentID: string, error: boolean) => void) {
      doActionWithError<CreatePaymentRequest, CreatePaymentResponse>(
        API.CREATE_PAYMENT,
        req,
        req.Message,
        (resp: CreatePaymentResponse): void => {
          this.insertOrder(resp.Info)
          handler(resp.Info.Order.Payment.ID, false)
        }, () => {
          handler(InvalidID, true)
        })
    },

    getOrders (req: GetOrdersRequest, done?: (error: boolean) => void) {
      doActionWithError<GetOrdersRequest, GetOrdersResponse>(
        API.GET_ORDERS,
        req,
        req.Message,
        (resp: GetOrdersResponse): void => {
          this.Orders = resp.Infos
          done?.(false)
        }, () => {
          done?.(true)
        })
    },

    updatePayment (req: UpdatePaymentRequest, done: () => void) {
      doAction<UpdatePaymentRequest, UpdatePaymentResponse>(
        API.UPDATE_PAYMENT,
        req,
        req.Message,
        (resp: UpdatePaymentResponse): void => {
          for (const order of this.Orders) {
            if (order.Order.Payment.ID === resp.Info.ID) {
              order.Order.Payment = resp.Info
              break
            }
          }
          done()
        })
    },

    getBaseOrders (req: GetBaseOrdersRequest, done?: (error: boolean) => void) {
      doActionWithError<GetBaseOrdersRequest, GetBaseOrdersResponse>(
        API.GET_BASE_ORDERRS,
        req,
        req.Message,
        (resp: GetBaseOrdersResponse): void => {
          this.BaseOrders = resp.Infos
          done?.(false)
        }, () => {
          done?.(true)
        })
    },
  }
})

export { PaymentState, OrderTimeoutSeconds, RemainMax } from './const'
export * from './types'
