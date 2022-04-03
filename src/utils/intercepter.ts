import { AxiosInstance, AxiosResponse } from 'axios'
import { Cookies } from 'quasar'
import { useLoginedUserStore } from '../store/logined'
import { LoginedResponse } from '../store/logined/types'
import { useSettingStore } from '../store/setting'
import {
  NavigationGuardNext,
  RouteLocationNormalized
} from 'vue-router'
import { API as UserAPI } from '../store/users/const'

interface RouteMetaImpl {
  ShowHeaderAnnouncement: boolean
  ShowMainHeader: boolean
  ShowBigLogo: boolean
  ShowSignHelper: boolean
  ShowFooterTop: boolean
  ShowTopTip: boolean
}

declare module 'vue-router' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface RouteMeta extends RouteMetaImpl {
  }
}

const loginInterceptor = (api: AxiosInstance, to: RouteLocationNormalized, next: NavigationGuardNext) => {
  const setting = useSettingStore()
  setting.ShowHeaderAnnouncement = to.meta.ShowHeaderAnnouncement
  setting.ShowMainHeader = to.meta.ShowMainHeader
  setting.ShowBigLogo = to.meta.ShowBigLogo
  setting.ShowSignHelper = to.meta.ShowSignHelper
  setting.ShowFooterTop = to.meta.ShowFooterTop
  setting.ShowTopTip = to.meta.ShowTopTip

  const logined = useLoginedUserStore()
  if (logined.getLogined) {
    next()
    return
  }

  const userID = Cookies.get('X-User-ID')
  const token = Cookies.get('X-App-Login-Token')
  if (!userID || !token || userID.length === 0 || token.length === 0) {
    if (to.meta && to.meta.NeedLogined) {
      next({ path: '/signin', replace: true })
    } else {
      next()
    }
    return
  }

  const headers = api.defaults.headers as unknown as Record<string, string>
  headers['X-User-ID'] = userID
  headers['X-App-Login-Token'] = token

  api.post<unknown, AxiosResponse<LoginedResponse>>(UserAPI.LOGINED)
    .then((resp: AxiosResponse<LoginedResponse>) => {
      logined.LoginedUser = resp.data.Info
      if (!logined.LoginedUser && to.meta && to.meta.NeedLogined) {
        next({ path: '/signin', replace: true })
        return
      }
      next()
    }).catch(() => {
      if (to.meta && to.meta.NeedLogined) {
        next({ path: '/signin', replace: true })
      } else {
        next()
      }
    })
}

export {
  loginInterceptor,
  RouteMetaImpl
}
