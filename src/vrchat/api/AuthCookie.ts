/**
 * 認証で使用するCookie
 */
import { CookieJar } from 'tough-cookie';

// ユーザーIDの正規表現
const AUTH_COOKIE_REGEX = /^authcookie_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const AUTH_COOKIE_DOMAIN = 'vrchat.com';

/**
 * fetch APIを使用するためのクライアント関数の型
 */
export type FetchClient = {
  get: (url: string, options?: RequestInit) => Promise<Response>;
  post: (url: string, data: any, options?: RequestInit) => Promise<Response>;
};

/**
 * 認証で使用するCookie
 */
export class AuthCookie {
  private value: string;
  private cookieJar: CookieJar;

  /**
   * コンストラクタ
   * @param auth authクッキーの値
   * @private このコンストラクタは直接呼び出さず、createメソッドを使用してください
   */
  private constructor(auth: string, cookieJar: CookieJar) {
    this.value = auth;
    this.cookieJar = cookieJar;
  }

  /**
   * AuthCookieインスタンスを作成する
   * @param auth authクッキーの値
   * @returns 正規表現にマッチする場合はAuthCookieインスタンス、それ以外はnull
   */
  static create(auth: string): AuthCookie | null {
    // 正規表現でインプットが正しいかを確認
    if (!AUTH_COOKIE_REGEX.test(auth)) {
      return null;
    }

    // CookieJarを作成
    const cookieJar = new CookieJar();
    cookieJar.setCookieSync(`auth=${auth}`, `https://${AUTH_COOKIE_DOMAIN}`);

    return new AuthCookie(auth, cookieJar);
  }

  /**
   * クッキーの値を取得する
   * @returns クッキーの値
   */
  getValue(): string {
    return this.value;
  }

  /**
   * fetch APIを使用するクライアントを作成する
   * @returns fetch APIを使用するクライアント
   */
  createClient(): FetchClient {
    // 共通のヘッダー
    const headers = {
      'Cookie': `auth=${this.value}`
    };

    return {
      get: async (url: string, options: RequestInit = {}) => {
        return fetch(url, {
          ...options,
          method: 'GET',
          credentials: 'include',
          headers: {
            ...headers,
            ...(options.headers || {})
          }
        });
      },
      post: async (url: string, data: any, options: RequestInit = {}) => {
        return fetch(url, {
          ...options,
          method: 'POST',
          credentials: 'include',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
            ...(options.headers || {})
          },
          body: JSON.stringify(data)
        });
      }
    };
  }
}
