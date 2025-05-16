/**
 * 使用可能な2段階認証の種類
 */
export enum TwoFactorType {
  /**
   * 無効
   */
  Invalid = "invalid",
  
  /**
   * メールに送信
   */
  EmailOtp = "emailOtp",
  
  /**
   * 認証アプリ
   */
  Totp = "totp",
  
  /**
   * リカバリーキー
   */
  Otp = "otp"
}

/**
 * 文字列からTwoFactorTypeに変換する
 * @param value 変換する文字列
 * @returns 対応するTwoFactorType、無効な場合はTwoFactorType.Invalid
 */
export function parseTwoFactorType(value: string): TwoFactorType {
  switch (value) {
    case "emailOtp":
      return TwoFactorType.EmailOtp;
    case "totp":
      return TwoFactorType.Totp;
    case "otp":
      return TwoFactorType.Otp;
    default:
      return TwoFactorType.Invalid;
  }
}