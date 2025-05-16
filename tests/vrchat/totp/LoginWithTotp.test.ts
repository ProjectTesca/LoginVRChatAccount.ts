import { login } from '../../../src/vrchat/totp/LoginWithTotp';
import { 
  CredentialData, 
  AuthUserResultType, 
  AuthUserResult, 
  sendAuthUserRequest,
  sendAuthTwoFactorAuthRequest
} from '../../../src/vrchat/api';
import { ClientUserAgent } from '../../../src/vrchat/api/ClientUserAgent';
import { AuthCookie } from '../../../src/vrchat/api/AuthCookie';
import { TwoFactorType } from '../../../src/vrchat/api/TwoFactorType';
import { v4 as uuidv4 } from 'uuid';

// モック関数をセットアップ
jest.mock('../../../src/vrchat/api', () => ({
  ...jest.requireActual('../../../src/vrchat/api'),
  sendAuthUserRequest: jest.fn(),
  sendAuthTwoFactorAuthRequest: jest.fn()
}));

describe('LoginWithTotp', () => {
  // テスト前にモックをリセット
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * login - 成功ケース
   * - 2段階認証なしで直接成功するケース
   */
  test('login_success_without_2fa', async () => {
    // AuthCookieをモック
    const uuid = uuidv4();
    const authCookieValue = `authcookie_${uuid}`;
    const authCookie = AuthCookie.create(authCookieValue);
    if (!authCookie) {
      throw new Error('Failed to create AuthCookie for testing');
    }

    // sendAuthUserRequestをモック
    const mockSendAuthUserRequest = sendAuthUserRequest as jest.MockedFunction<typeof sendAuthUserRequest>;
    mockSendAuthUserRequest.mockResolvedValue({
      type: AuthUserResultType.Success,
      authCookie
    });

    // テスト実行
    const credentialData = new CredentialData('testuser', 'password');
    const userAgent = new ClientUserAgent('TEST_APP', '1.0.0');
    const result = await login(credentialData, userAgent, 'TOTP_SECRET');

    // 結果を検証
    expect(result).toBe(authCookie);
    expect(mockSendAuthUserRequest).toHaveBeenCalledWith(credentialData, userAgent);
  });

  /**
   * login - 成功ケース
   * - 2段階認証が必要で、TOTPで認証成功するケース
   */
  test('login_success_with_totp', async () => {
    // AuthCookieをモック
    const uuid = uuidv4();
    const authCookieValue = `authcookie_${uuid}`;
    const authCookie = AuthCookie.create(authCookieValue);
    if (!authCookie) {
      throw new Error('Failed to create AuthCookie for testing');
    }

    // sendAuthUserRequestをモック
    const mockSendAuthUserRequest = sendAuthUserRequest as jest.MockedFunction<typeof sendAuthUserRequest>;
    mockSendAuthUserRequest.mockResolvedValue({
      type: AuthUserResultType.RequiresTwoFactorAuth,
      authCookie,
      twoFactorTypes: [TwoFactorType.Totp]
    });

    // sendAuthTwoFactorAuthRequestをモック
    const mockSendAuthTwoFactorAuthRequest = sendAuthTwoFactorAuthRequest as jest.MockedFunction<typeof sendAuthTwoFactorAuthRequest>;
    mockSendAuthTwoFactorAuthRequest.mockResolvedValue(true);

    // テスト実行
    const credentialData = new CredentialData('testuser', 'password');
    const userAgent = new ClientUserAgent('TEST_APP', '1.0.0');
    const result = await login(credentialData, userAgent, 'TOTP_SECRET');

    // 結果を検証
    expect(result).toBe(authCookie);
    expect(mockSendAuthUserRequest).toHaveBeenCalledWith(credentialData, userAgent);
    expect(mockSendAuthTwoFactorAuthRequest).toHaveBeenCalledWith(
      expect.any(String), // TOTPコードは動的に生成されるため、任意の文字列として検証
      TwoFactorType.Totp,
      authCookie,
      userAgent
    );
  });

  /**
   * login - 失敗ケース
   * - 2段階認証が必要だが、TOTPが含まれていないケース
   */
  test('login_fail_totp_not_included', async () => {
    // AuthCookieをモック
    const uuid = uuidv4();
    const authCookieValue = `authcookie_${uuid}`;
    const authCookie = AuthCookie.create(authCookieValue);
    if (!authCookie) {
      throw new Error('Failed to create AuthCookie for testing');
    }

    // sendAuthUserRequestをモック
    const mockSendAuthUserRequest = sendAuthUserRequest as jest.MockedFunction<typeof sendAuthUserRequest>;
    mockSendAuthUserRequest.mockResolvedValue({
      type: AuthUserResultType.RequiresTwoFactorAuth,
      authCookie,
      twoFactorTypes: [TwoFactorType.EmailOtp] // TOTPは含まれていない
    });

    // テスト実行
    const credentialData = new CredentialData('testuser', 'password');
    const userAgent = new ClientUserAgent('TEST_APP', '1.0.0');
    const result = await login(credentialData, userAgent, 'TOTP_SECRET');

    // 結果を検証
    expect(result).toBe("Totp is not included in the account login method.");
    expect(mockSendAuthUserRequest).toHaveBeenCalledWith(credentialData, userAgent);
  });

  /**
   * login - 失敗ケース
   * - 2段階認証が必要で、TOTPが含まれているが、認証に失敗するケース
   */
  test('login_fail_totp_auth_failed', async () => {
    // AuthCookieをモック
    const uuid = uuidv4();
    const authCookieValue = `authcookie_${uuid}`;
    const authCookie = AuthCookie.create(authCookieValue);
    if (!authCookie) {
      throw new Error('Failed to create AuthCookie for testing');
    }

    // sendAuthUserRequestをモック
    const mockSendAuthUserRequest = sendAuthUserRequest as jest.MockedFunction<typeof sendAuthUserRequest>;
    mockSendAuthUserRequest.mockResolvedValue({
      type: AuthUserResultType.RequiresTwoFactorAuth,
      authCookie,
      twoFactorTypes: [TwoFactorType.Totp]
    });

    // sendAuthTwoFactorAuthRequestをモック（失敗）
    const mockSendAuthTwoFactorAuthRequest = sendAuthTwoFactorAuthRequest as jest.MockedFunction<typeof sendAuthTwoFactorAuthRequest>;
    mockSendAuthTwoFactorAuthRequest.mockResolvedValue(false);

    // テスト実行
    const credentialData = new CredentialData('testuser', 'password');
    const userAgent = new ClientUserAgent('TEST_APP', '1.0.0');
    const result = await login(credentialData, userAgent, 'TOTP_SECRET');

    // 結果を検証
    expect(result).toBe("Totp auth failed. check totp_secret.");
    expect(mockSendAuthUserRequest).toHaveBeenCalledWith(credentialData, userAgent);
    expect(mockSendAuthTwoFactorAuthRequest).toHaveBeenCalledWith(
      expect.any(String),
      TwoFactorType.Totp,
      authCookie,
      userAgent
    );
  });

  /**
   * login - 失敗ケース
   * - ログイン自体が失敗するケース
   */
  test('login_fail_auth_failed', async () => {
    // sendAuthUserRequestをモック
    const mockSendAuthUserRequest = sendAuthUserRequest as jest.MockedFunction<typeof sendAuthUserRequest>;
    mockSendAuthUserRequest.mockResolvedValue({
      type: AuthUserResultType.Failed,
      errorMessage: "Invalid username or password"
    });

    // テスト実行
    const credentialData = new CredentialData('testuser', 'password');
    const userAgent = new ClientUserAgent('TEST_APP', '1.0.0');
    const result = await login(credentialData, userAgent, 'TOTP_SECRET');

    // 結果を検証
    expect(result).toBe("Invalid username or password");
    expect(mockSendAuthUserRequest).toHaveBeenCalledWith(credentialData, userAgent);
  });
});