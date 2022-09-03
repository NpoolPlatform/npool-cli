enum API {
  SEND_EMAIL_CODE = '/third-gateway/v1/send/email/code',
  SEND_SMS_CODE = '/third-gateway/v1/send/sms/code',
  VERIFY_GOOGLE_AUTHENTICATION = '/third-gateway/v1/verify/google/authentication',
  VERIFY_EMAIL_CODE = '/third-gateway/v1/verify/email/code',
  VERIFY_SMS_CODE = '/third-gateway/v1/verify/sms/code',
  CONTACT_BY_EMAIL = '/third-gateway/v1/contact/by/email'
}

enum MessageUsedFor {
  Signup = 'SIGNUP',
  Update = 'UPDATE',
  SetWithdrawAddress = 'SETWITHDRAWADDRESS',
  Signin = 'SIGNIN',
  Withdraw = 'WITHDRAW',
  Contact = 'CONTACT',
  CreateInvitationCode = 'CREATEINVITATIONCODE',
  SetCommission = 'SETCOMMISSION',
  UsedForSetTransferTargetUser = 'SETTRANSFERTARGETUSER',
  UsedForTransfer = 'TRANSFER'
}

const MessageUsedFors = [
  MessageUsedFor.Contact,
  MessageUsedFor.SetWithdrawAddress,
  MessageUsedFor.Signin,
  MessageUsedFor.Signup,
  MessageUsedFor.Update,
  MessageUsedFor.Withdraw,
  MessageUsedFor.CreateInvitationCode,
  MessageUsedFor.SetCommission,
  MessageUsedFor.UsedForSetTransferTargetUser,
  MessageUsedFor.UsedForTransfer
]

export {
  API,
  MessageUsedFor,
  MessageUsedFors
}
