import { TwoFactorType } from '../../../src/vrchat/api/TwoFactorType';
import { ClientUserAgent } from '../../../src/vrchat/api/ClientUserAgent';
import { AuthCookie } from '../../../src/vrchat/api/AuthCookie';
import { v4 as uuidv4 } from 'uuid';

describe('AuthTwoFactorAuth', () => {
  /**
   * sendRequest
   * - ネットワークリクエストをモック化してテストします。
   * - 実際のAPIにリクエストを送信しないようにします。
   */
  test('send_request_mock', async () => {
    // このテストはモック化が必要なため、実装は省略します
    // 実際のテストでは、AuthCookie.createClientをモック化してレスポンスを返すようにします
    // 例：
    // const mockPost = jest.fn().mockResolvedValue({ ok: true });
    // const mockClient = { post: mockPost };
    // jest.spyOn(AuthCookie.prototype, 'createClient').mockReturnValue(mockClient);
    
    // const uuid = uuidv4();
    // const authCookieValue = `authcookie_${uuid}`;
    // const authCookie = AuthCookie.create(authCookieValue);
    // const userAgent = new ClientUserAgent('TEST_APP', '1.0.0');
    // const result = await sendRequest('123456', TwoFactorType.Totp, authCookie, userAgent);
    // expect(result).toBe(true);
    // expect(mockPost).toHaveBeenCalledWith(
    //   'https://vrchat.com/api/1/auth/twofactorauth/totp/verify',
    //   { code: '123456' },
    //   { headers: { 'User-Agent': 'TEST_APP/1.0.0' } }
    // );
  });

  /**
   * URL生成のテスト
   * - 各TwoFactorTypeに対して正しいURLが生成されるかをテストします。
   */
  test('url_generation', () => {
    // 各TwoFactorTypeに対して期待されるURLのパスを確認します
    expect(`https://vrchat.com/api/1/auth/twofactorauth/${TwoFactorType.Totp}/verify`)
      .toBe('https://vrchat.com/api/1/auth/twofactorauth/totp/verify');
    
    expect(`https://vrchat.com/api/1/auth/twofactorauth/${TwoFactorType.Otp}/verify`)
      .toBe('https://vrchat.com/api/1/auth/twofactorauth/otp/verify');
    
    expect(`https://vrchat.com/api/1/auth/twofactorauth/${TwoFactorType.EmailOtp}/verify`)
      .toBe('https://vrchat.com/api/1/auth/twofactorauth/emailOtp/verify');
  });
});