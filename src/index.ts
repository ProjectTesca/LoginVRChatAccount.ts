/**
 * VRChatアカウントの検証機能を提供するnpmパッケージ
 */

// vrchatモジュールをエクスポート
export * as vrchat from './vrchat';

// 便利なように直接エクスポート
export { 
  ClientUserAgent,
  CredentialData,
  AuthUserResultType,
  AuthUserResult,
  sendAuthUserRequest,
  sendAuthTwoFactorAuthRequest
} from './vrchat/api';

// TOTPログイン機能をエクスポート
export { login as loginWithTotp } from './vrchat/totp';
