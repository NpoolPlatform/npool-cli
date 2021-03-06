import { ReqMessage } from '../../local/notifications/types'

interface App {
  ID: string
  CreatedBy: string
  Name: string
  Logo: string
  Description: string
  CreateAt: number
}

interface AppControl {
  ID: string
  AppID: string
  SignupMethods: Array<string>
  ExternSigninMethods: Array<string>
  RecaptchaMethod: string
  KycEnable: boolean
  SigninVerifyEnable: boolean
  InvitationCodeMust: boolean
}

interface BanApp {
  ID: string
  AppID: string
  Message: string
}

interface Application {
  App: App
  Ctrl: AppControl
  Ban: BanApp
}

interface GetApplicationResponse {
  Info: Application
}

interface GetApplicationRequest {
  ID: string
  Message: ReqMessage
}

interface ApplicationState {
  Application: Application
}

export {
  App,
  AppControl,
  BanApp,
  Application,
  GetApplicationRequest,
  GetApplicationResponse,
  ApplicationState
}
