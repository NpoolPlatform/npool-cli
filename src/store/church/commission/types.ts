import { BaseRequest } from '../../base'
import {
  CommissionCoinSetting,
  CreateCommissionSettingRequest,
  CreateCommissionSettingResponse,
  GetCommissionSettingRequest,
  GetCommissionSettingResponse
} from '../../admin'

interface CreateAppCommissionSettingRequest extends CreateCommissionSettingRequest {
  TargetAppID: string
}

interface CreateAppCommissionSettingResponse extends CreateCommissionSettingResponse {
}

interface GetAppCommissionSettingRequest extends GetCommissionSettingRequest {
  TargetAppID: string
}

interface GetAppCommissionSettingResponse extends GetCommissionSettingResponse {
}

interface CreateCommissionCoinSettingRequest extends BaseRequest {
  Info: CommissionCoinSetting
}

interface CreateCommissionCoinSettingResponse {
  Info: CommissionCoinSetting
}

interface UpdateCommissionCoinSettingRequest extends BaseRequest {
  Info: CommissionCoinSetting
}

interface UpdateCommissionCoinSettingResponse {
  Info: CommissionCoinSetting
}

export {
  CreateAppCommissionSettingRequest,
  CreateAppCommissionSettingResponse,
  GetAppCommissionSettingRequest,
  GetAppCommissionSettingResponse,
  CreateCommissionCoinSettingRequest,
  CreateCommissionCoinSettingResponse,
  UpdateCommissionCoinSettingRequest,
  UpdateCommissionCoinSettingResponse
}
