/**
 * Totpを用いたログインを行います。
 */
import { authenticator } from 'otplib';
import { 
  CredentialData, 
  AuthUserResultType, 
  AuthUserResult, 
  sendAuthUserRequest,
  sendAuthTwoFactorAuthRequest
} from '../api';
import { ClientUserAgent } from '../api/ClientUserAgent';
import { AuthCookie } from '../api/AuthCookie';
import { TwoFactorType } from '../api/TwoFactorType';

/**
 * Totpを用いたログインを行います。
 * @param credentialData ログインに使うユーザーの認証データ
 * @param userAgent 使用するUser-Agent
 * @param totpSecretEncoded totpの設定時に用いるシークレット(base64によるエンコード済み)
 * @returns 成功時はAuthCookieを返します、失敗時はエラーメッセージを返します
 */
export async function login(
  credentialData: CredentialData,
  userAgent: ClientUserAgent,
  totpSecretEncoded: string
): Promise<AuthCookie | string> {
  const loginResult = await sendAuthUserRequest(credentialData, userAgent);

  switch (loginResult.type) {
    case AuthUserResultType.Success:
      if (loginResult.authCookie) {
        return loginResult.authCookie;
      }
      return "Authentication succeeded but no auth cookie was returned.";

    case AuthUserResultType.RequiresTwoFactorAuth:
      if (!loginResult.twoFactorTypes?.includes(TwoFactorType.Totp)) {
        return "Totp is not included in the account login method.";
      }

      if (!loginResult.authCookie) {
        return "No auth cookie was returned.";
      }

      const isSuccess = await sendTotpTwoFactorAuthRequest(
        totpSecretEncoded,
        loginResult.authCookie,
        userAgent
      );

      if (!isSuccess) {
        return "Totp auth failed. check totp_secret.";
      }

      return loginResult.authCookie;

    case AuthUserResultType.Failed:
      return loginResult.errorMessage || "Invalid username or password";
  }
}

/**
 * totpによる二段階認証を行います。
 * @param totpSecretEncoded totpの設定時に用いるシークレット(base64によるエンコード済み)
 * @param authCookie 認証Cookie
 * @param userAgent 使用するUser-Agent
 * @returns リクエストが成功したらtrueを返す
 */
async function sendTotpTwoFactorAuthRequest(
  totpSecretEncoded: string,
  authCookie: AuthCookie,
  userAgent: ClientUserAgent
): Promise<boolean> {
  try {
    // otplibの設定
    authenticator.options = {
      digits: 6,
      step: 30,
      // SHA1アルゴリズムを使用
      algorithm: 'sha1' as any
    };

    // 現在の認証コードを取得
    const token = authenticator.generate(totpSecretEncoded);

    // vrchatのapiへtotpの二段階認証のリクエストを送る
    return await sendAuthTwoFactorAuthRequest(token, TwoFactorType.Totp, authCookie, userAgent);
  } catch (error) {
    return false;
  }
}
