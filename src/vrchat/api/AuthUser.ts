/**
 * VRChatへのログインのAPI([get-/auth/user](https://vrchatapi.github.io/docs/api/#get-/auth/user))を送信します。
 */
import { Base64 } from 'js-base64';
import { AuthCookie } from './AuthCookie';
import { ClientUserAgent } from './ClientUserAgent';
import { TwoFactorType, parseTwoFactorType } from './TwoFactorType';

/**
 * 認証データ
 */
export class CredentialData {
  private username: string;
  private password: string;

  /**
   * コンストラクタ
   * @param username ユーザー名
   * @param password パスワード
   */
  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  /**
   * VRChatのBasic認証に必要なbase64(urlencode(username):urlencode(password))を作成します。
   * @returns base64の文字列
   */
  toBase64(): string {
    // 各値をurlencodeに変換して:でつなぐ
    const usernamePassword = `${encodeURIComponent(this.username)}:${encodeURIComponent(this.password)}`;
    // base64に
    return Base64.encode(usernamePassword);
  }
}

/**
 * ログインリクエストを送った結果の種類
 */
export enum AuthUserResultType {
  Success,
  Failed,
  RequiresTwoFactorAuth
}

/**
 * ログインリクエストの結果
 */
export interface AuthUserResult {
  type: AuthUserResultType;
  authCookie?: AuthCookie;
  errorMessage?: string;
  twoFactorTypes?: TwoFactorType[];
}

/**
 * ログインのリクエストを送信します。
 * @param credentialData ログインに使用する認証データ
 * @param userAgent ヘッダーに乗せるUserAgent
 * @returns ログインリクエストを送った結果
 */
export async function sendRequest(
  credentialData: CredentialData,
  userAgent: ClientUserAgent
): Promise<AuthUserResult> {
  // リクエストを作成して送信
  const credential = credentialData.toBase64();

  try {
    const response = await fetch('https://vrchat.com/api/1/auth/user', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${credential}`,
        'User-Agent': userAgent.toHeaderString()
      },
      credentials: 'include'
    });

    // ステータスコードを確認
    if (!response.ok) {
      return {
        type: AuthUserResultType.Failed,
        errorMessage: `Error status code: ${response.status}`
      };
    }

    // cookieから"auth"のフィールドを取得
    const setCookieHeader = response.headers.get('set-cookie') || '';
    const cookies = setCookieHeader.split(', ');
    const authCookieStr = cookies
      .map((cookie: string) => cookie.split(';')[0])
      .find((cookie: string) => cookie.startsWith('auth='));

    if (!authCookieStr) {
      return {
        type: AuthUserResultType.Failed,
        errorMessage: '"auth" field not found in cookies.'
      };
    }

    const authValue = authCookieStr.substring(5); // 'auth=' の後の部分を取得
    const authCookie = AuthCookie.create(authValue);

    if (!authCookie) {
      return {
        type: AuthUserResultType.Failed,
        errorMessage: 'Invalid format of auth cookie.'
      };
    }

    // レスポンスのJSONを取得
    const responseData = await response.json();

    // 2段階認証の要求がなければ成功
    if (!responseData.requiresTwoFactorAuth) {
      return {
        type: AuthUserResultType.Success,
        authCookie
      };
    }

    // 受け付ける2段階認証の方法
    const twoFactorTypes: TwoFactorType[] = [];

    // jsonの値を配列に変更
    if (!Array.isArray(responseData.requiresTwoFactorAuth)) {
      return {
        type: AuthUserResultType.Failed,
        errorMessage: 'Two factor types missing.'
      };
    }

    for (const typeStr of responseData.requiresTwoFactorAuth) {
      if (typeof typeStr !== 'string') {
        continue;
      }

      const twoFactorType = parseTwoFactorType(typeStr);
      if (twoFactorType !== TwoFactorType.Invalid) {
        twoFactorTypes.push(twoFactorType);
      }
    }

    return {
      type: AuthUserResultType.RequiresTwoFactorAuth,
      authCookie,
      twoFactorTypes
    };
  } catch (error) {
    return {
      type: AuthUserResultType.Failed,
      errorMessage: error instanceof Error ? error.message : 'Request failed.'
    };
  }
}
