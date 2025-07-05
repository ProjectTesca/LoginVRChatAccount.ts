# LoginVRChatAccount

VRChatアカウントの認証機能を提供するnpmパッケージです。VRChatアカウントのログイン処理や2段階認証（TOTP）をサポートしています。

## 機能

- VRChatアカウントの基本認証
- 2段階認証（TOTP）のサポート
- 認証クッキーを使用したAPI呼び出し

## インストール

`.npmrc`に以下を記述します：
```
@projecttesca:registry=https://npm.pkg.github.com
```
> 詳細: https://docs.github.com/ja/packages/working-with-a-github-packages-registry/working-with-the-npm-registry

npmを使用してインストールできます：
```bash
npm install @projecttesca/login-vrchat-account@0.1.1
```

## 基本的な使用方法

### 基本認証

```typescript
import { 
  CredentialData, 
  ClientUserAgent, 
  sendAuthUserRequest, 
  AuthUserResultType 
} from 'login-vrchat-account';

async function login() {
  // 認証情報を作成
  const credentials = new CredentialData('your_username', 'your_password');

  // ユーザーエージェントを作成
  const userAgent = new ClientUserAgent('MyApp', '1.0.0', 'contact@example.com');

  // ログインリクエストを送信
  const result = await sendAuthUserRequest(credentials, userAgent);

  // 結果を処理
  switch (result.type) {
    case AuthUserResultType.Success:
      console.log('ログイン成功！');
      console.log('認証クッキー:', result.authCookie?.getValue());
      return result.authCookie;

    case AuthUserResultType.RequiresTwoFactorAuth:
      console.log('2段階認証が必要です');
      console.log('利用可能な認証方法:', result.twoFactorTypes);
      return null;

    case AuthUserResultType.Failed:
      console.log('ログイン失敗:', result.errorMessage);
      return null;
  }
}
```

### TOTPを使用した2段階認証

```typescript
import { loginWithTotp, CredentialData, ClientUserAgent } from 'login-vrchat-account';

async function loginWithTOTP() {
  // 認証情報を作成
  const credentials = new CredentialData('your_username', 'your_password');

  // ユーザーエージェントを作成
  const userAgent = new ClientUserAgent('MyApp', '1.0.0');

  // TOTPシークレットを指定してログイン
  const result = await loginWithTotp(credentials, userAgent, 'your_totp_secret');

  if (typeof result === 'string') {
    console.log('ログイン失敗:', result);
    return null;
  } else {
    console.log('ログイン成功！');
    console.log('認証クッキー:', result.getValue());
    return result;
  }
}
```

## 詳細な使用例

より詳細な使用例については、[Example.md](./Example.md)を参照してください。

## API リファレンス

### 主要なクラス

#### CredentialData

ユーザー名とパスワードを管理するクラスです。

```typescript
const credentials = new CredentialData('username', 'password');
```

#### ClientUserAgent

ユーザーエージェント情報を管理するクラスです。

```typescript
const userAgent = new ClientUserAgent('AppName', '1.0.0', 'contact@example.com');
```

#### AuthCookie

認証クッキーを管理するクラスです。

```typescript
const authCookie = AuthCookie.create('authcookie_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx');
```

### 主要な関数

#### sendAuthUserRequest

VRChatにログインリクエストを送信します。

```typescript
const result = await sendAuthUserRequest(credentials, userAgent);
```

#### sendAuthTwoFactorAuthRequest

2段階認証リクエストを送信します。

```typescript
const success = await sendAuthTwoFactorAuthRequest(
  'verification_code', 
  TwoFactorType.Totp, 
  authCookie, 
  userAgent
);
```

#### loginWithTotp

TOTPを使用してログインします。

```typescript
const result = await loginWithTotp(credentials, userAgent, 'totp_secret');
```
