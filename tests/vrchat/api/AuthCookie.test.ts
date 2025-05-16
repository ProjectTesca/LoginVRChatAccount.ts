import { AuthCookie } from '../../../src/vrchat/api/AuthCookie';
import { v4 as uuidv4 } from 'uuid';

describe('AuthCookie', () => {
  /**
   * auth_cookie_random_test
   * - ランダムに生成したクッキー用の値が全て成功するかを確認します。
   */
  test('auth_cookie_random_test', () => {
    for (let i = 0; i < 10; i++) {
      const uuid = uuidv4();
      const authCookieValue = `authcookie_${uuid}`;
      console.log(`auth_cookie: ${authCookieValue}`);

      const authCookie = AuthCookie.create(authCookieValue);
      expect(authCookie).not.toBeNull();
    }
  });

  /**
   * invalid_cookie_format_test
   * - 無効なクッキー用の値が失敗するかを確認します。
   */
  test('invalid_cookie_format_test', () => {
    // UUIDの形式が不正
    let authCookieValue = "authcookie_11e8022b-163a-5520-afd3-452d82e6aee";
    expect(AuthCookie.create(authCookieValue)).toBeNull();

    // プレフィックスが不正
    authCookieValue = "_271a06ea-6f24-56e5-84f6-c77fc28293d3";
    expect(AuthCookie.create(authCookieValue)).toBeNull();

    // UUIDの形式が不正（ハイフンの位置が不正）
    authCookieValue = "authcookie_1d28bcb5-6934-5050-a3a-57ebcbb41678";
    expect(AuthCookie.create(authCookieValue)).toBeNull();

    // UUIDの形式が不正（文字数が不足）
    authCookieValue = "authcookie_23abf94-8e2-57e0-b207-f16d609744ad";
    expect(AuthCookie.create(authCookieValue)).toBeNull();
  });

  /**
   * getValue_test
   * - getValue()メソッドが正しい値を返すかを確認します。
   */
  test('getValue_test', () => {
    const uuid = uuidv4();
    const authCookieValue = `authcookie_${uuid}`;
    
    const authCookie = AuthCookie.create(authCookieValue);
    expect(authCookie).not.toBeNull();
    expect(authCookie?.getValue()).toBe(authCookieValue);
  });

  /**
   * createClient_test
   * - createClient()メソッドが正しいクライアントを返すかを確認します。
   */
  test('createClient_test', () => {
    const uuid = uuidv4();
    const authCookieValue = `authcookie_${uuid}`;
    
    const authCookie = AuthCookie.create(authCookieValue);
    expect(authCookie).not.toBeNull();
    
    const client = authCookie?.createClient();
    expect(client).toBeDefined();
    expect(client?.get).toBeDefined();
    expect(client?.post).toBeDefined();
  });
});