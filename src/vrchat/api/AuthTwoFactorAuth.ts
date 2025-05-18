/**
 * VRChatへの2段階認証のAPIを送信します。
 * * [/auth/twofactorauth/totp/verify](https://vrchatapi.github.io/docs/api/#post-/auth/twofactorauth/totp/verify)
 * * [/auth/twofactorauth/otp/verify](https://vrchatapi.github.io/docs/api/#post-/auth/twofactorauth/otp/verify)
 * * [/auth/twofactorauth/emailotp/verify](https://vrchatapi.github.io/docs/api/#post-/auth/twofactorauth/emailotp/verify)
 */
import { AuthCookie } from './AuthCookie';
import { ClientUserAgent } from './ClientUserAgent';
import { TwoFactorType } from './TwoFactorType';

/**
 * 2段階認証のリクエストを送信します。
 * @param code 認証に用いるコード
 * @param twoFactorType 2段階認証の種類
 * @param authCookie 認証Cookie
 * @param userAgent 使用するUser-Agent
 * @returns リクエストが成功したらtrueを返す
 */
export async function sendRequest(
  code: string,
  twoFactorType: TwoFactorType,
  authCookie: AuthCookie,
  userAgent: ClientUserAgent
): Promise<boolean> {
  const url = `https://api.vrchat.cloud/api/1/auth/twofactorauth/${twoFactorType}/verify`;

  // リクエストを作成
  const client = authCookie.createClient();

  try {
    const response = await client.post(
      url,
      { code },
      {
        headers: {
          'User-Agent': userAgent.toHeaderString()
        }
      }
    );

    return response.ok;
  } catch (error) {
    return false;
  }
}
