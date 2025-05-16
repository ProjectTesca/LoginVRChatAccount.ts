# LoginVRChatAccount 使用例

このドキュメントでは、LoginVRChatAccountライブラリの詳細な使用例を紹介します。

## 目次

- [基本認証](#基本認証)
- [2段階認証（TOTP）](#2段階認証totp)
- [認証クッキーを使用したAPI呼び出し](#認証クッキーを使用したapi呼び出し)
- [エラーハンドリング](#エラーハンドリング)

## 基本認証

VRChatアカウントの基本認証を行う例です。

```typescript
import { 
  CredentialData, 
  ClientUserAgent, 
  sendAuthUserRequest, 
  AuthUserResultType 
} from 'login-vrchat-account';

async function basicAuthentication() {
  try {
    // 認証情報を作成
    const credentials = new CredentialData('your_username', 'your_password');

    // ユーザーエージェントを作成（アプリ名、バージョン、連絡先）
    const userAgent = new ClientUserAgent('MyVRChatApp', '1.0.0', 'contact@example.com');

    // ログインリクエストを送信
    const result = await sendAuthUserRequest(credentials, userAgent);

    // 結果を処理
    switch (result.type) {
      case AuthUserResultType.Success:
        console.log('ログイン成功！');
        console.log('認証クッキー:', result.authCookie?.getValue());

        // 認証クッキーを使用して他のAPIを呼び出すことができます
        const authCookie = result.authCookie;
        if (authCookie) {
          // 認証クッキーを保存するなどの処理
          return authCookie;
        }
        break;

      case AuthUserResultType.RequiresTwoFactorAuth:
        console.log('2段階認証が必要です');
        console.log('利用可能な認証方法:', result.twoFactorTypes);

        // 2段階認証の処理に進む
        // 例: 2段階認証コードの入力を促す
        break;

      case AuthUserResultType.Failed:
        console.log('ログイン失敗:', result.errorMessage);
        // エラーハンドリング
        break;
    }
  } catch (error) {
    console.error('認証中にエラーが発生しました:', error);
  }

  return null;
}
```

## 2段階認証（TOTP）

TOTPを使用した2段階認証の例です。

### 方法1: 個別のステップで実行

```typescript
import { 
  CredentialData, 
  ClientUserAgent, 
  sendAuthUserRequest, 
  sendAuthTwoFactorAuthRequest,
  AuthUserResultType,
  TwoFactorType
} from 'login-vrchat-account';
import { authenticator } from 'otplib'; // otplibは別途インストールが必要

async function totpAuthentication() {
  try {
    // 認証情報を作成
    const credentials = new CredentialData('your_username', 'your_password');

    // ユーザーエージェントを作成
    const userAgent = new ClientUserAgent('MyVRChatApp', '1.0.0');

    // 最初のログインリクエストを送信
    const result = await sendAuthUserRequest(credentials, userAgent);

    if (result.type === AuthUserResultType.RequiresTwoFactorAuth) {
      // 2段階認証が必要な場合

      // TOTPが利用可能か確認
      if (result.twoFactorTypes?.includes(TwoFactorType.Totp) && result.authCookie) {
        // TOTPシークレット（事前に設定したもの）
        const totpSecret = 'your_totp_secret';

        // TOTPコードを生成
        authenticator.options = {
          digits: 6,
          step: 30,
          algorithm: 'sha1' as any
        };
        const totpCode = authenticator.generate(totpSecret);

        // 2段階認証リクエストを送信
        const success = await sendAuthTwoFactorAuthRequest(
          totpCode,
          TwoFactorType.Totp,
          result.authCookie,
          userAgent
        );

        if (success) {
          console.log('2段階認証成功！');
          return result.authCookie;
        } else {
          console.log('2段階認証失敗');
        }
      } else {
        console.log('TOTPによる認証はサポートされていません');
      }
    } else if (result.type === AuthUserResultType.Success) {
      console.log('2段階認証なしでログイン成功！');
      return result.authCookie;
    } else {
      console.log('ログイン失敗:', result.errorMessage);
    }
  } catch (error) {
    console.error('認証中にエラーが発生しました:', error);
  }

  return null;
}
```

### 方法2: 統合関数を使用

```typescript
import { 
  loginWithTotp, 
  CredentialData, 
  ClientUserAgent 
} from 'login-vrchat-account';

async function simpleTotpAuthentication() {
  try {
    // 認証情報を作成
    const credentials = new CredentialData('your_username', 'your_password');

    // ユーザーエージェントを作成
    const userAgent = new ClientUserAgent('MyVRChatApp', '1.0.0');

    // TOTPシークレットを指定してログイン
    const result = await loginWithTotp(credentials, userAgent, 'your_totp_secret');

    if (typeof result === 'string') {
      // エラーメッセージが返された場合
      console.log('ログイン失敗:', result);
    } else {
      // 認証クッキーが返された場合
      console.log('ログイン成功！');
      console.log('認証クッキー:', result.getValue());
      return result;
    }
  } catch (error) {
    console.error('認証中にエラーが発生しました:', error);
  }

  return null;
}
```

## 認証クッキーを使用したAPI呼び出し

認証クッキーを使用して他のVRChat APIを呼び出す例です。

```typescript
import { AuthCookie } from 'login-vrchat-account';

async function callVRChatAPI(authCookie: AuthCookie) {
  try {
    // クライアントを作成
    const client = authCookie.createClient();

    // 例: ユーザー情報を取得
    const response = await client.get('https://vrchat.com/api/1/auth/user');

    if (response.ok) {
      const userData = await response.json();
      console.log('ユーザー情報:', userData);
      return userData;
    } else {
      console.log('APIリクエスト失敗:', response.status);
    }
  } catch (error) {
    console.error('APIリクエスト中にエラーが発生しました:', error);
  }

  return null;
}

// 例: 認証後にAPIを呼び出す
async function authenticateAndCallAPI() {
  // 認証を行う（上記の例を参照）
  const authCookie = await simpleTotpAuthentication();

  if (authCookie) {
    // 認証成功後、APIを呼び出す
    const userData = await callVRChatAPI(authCookie);
    // 取得したデータを処理
  }
}
```

## エラーハンドリング

エラーハンドリングの例です。

```typescript
import { 
  CredentialData, 
  ClientUserAgent, 
  sendAuthUserRequest, 
  AuthUserResultType 
} from 'login-vrchat-account';

async function authenticationWithErrorHandling() {
  try {
    const credentials = new CredentialData('your_username', 'your_password');
    const userAgent = new ClientUserAgent('MyVRChatApp', '1.0.0');

    const result = await sendAuthUserRequest(credentials, userAgent);

    switch (result.type) {
      case AuthUserResultType.Success:
        return result.authCookie;

      case AuthUserResultType.RequiresTwoFactorAuth:
        // 2段階認証が必要な場合のエラーハンドリング
        throw new Error('2段階認証が必要です。別の認証方法を使用してください。');

      case AuthUserResultType.Failed:
        // 認証失敗の詳細なエラーハンドリング
        if (result.errorMessage?.includes('status code: 401')) {
          throw new Error('ユーザー名またはパスワードが間違っています。');
        } else if (result.errorMessage?.includes('status code: 429')) {
          throw new Error('リクエスト回数の制限に達しました。しばらく待ってから再試行してください。');
        } else {
          throw new Error(`認証に失敗しました: ${result.errorMessage}`);
        }
    }
  } catch (error) {
    // エラーをログに記録
    console.error('認証エラー:', error);

    // エラーを上位に伝播
    throw error;
  }
}

// 使用例
async function main() {
  try {
    const authCookie = await authenticationWithErrorHandling();
    if (authCookie) {
      console.log('認証成功！');
      // 認証成功後の処理
    }
  } catch (error) {
    console.error('エラーが発生しました:', error.message);
    // ユーザーにエラーを表示するなどの処理
  }
}
```

## 完全な使用例

基本認証から2段階認証、API呼び出しまでの完全な例です。

```typescript
import { 
  CredentialData, 
  ClientUserAgent, 
  sendAuthUserRequest, 
  sendAuthTwoFactorAuthRequest,
  AuthUserResultType,
  TwoFactorType,
  AuthCookie
} from 'login-vrchat-account';

async function completeAuthenticationExample() {
  // 認証情報を作成
  const credentials = new CredentialData('your_username', 'your_password');

  // ユーザーエージェントを作成
  const userAgent = new ClientUserAgent('MyVRChatApp', '1.0.0', 'contact@example.com');

  try {
    // ステップ1: 基本認証
    console.log('基本認証を実行中...');
    const authResult = await sendAuthUserRequest(credentials, userAgent);

    let authCookie: AuthCookie | null = null;

    if (authResult.type === AuthUserResultType.Success) {
      // 認証成功
      console.log('基本認証成功！');
      authCookie = authResult.authCookie || null;
    } 
    else if (authResult.type === AuthUserResultType.RequiresTwoFactorAuth) {
      // 2段階認証が必要
      console.log('2段階認証が必要です');

      if (authResult.twoFactorTypes?.includes(TwoFactorType.Totp) && authResult.authCookie) {
        // ステップ2: TOTP認証
        console.log('TOTP認証を実行中...');

        // 実際のアプリケーションでは、ユーザーからTOTPコードを取得するか、
        // 保存されたTOTPシークレットから生成します
        const totpCode = '123456'; // 例として固定値を使用

        const totpSuccess = await sendAuthTwoFactorAuthRequest(
          totpCode,
          TwoFactorType.Totp,
          authResult.authCookie,
          userAgent
        );

        if (totpSuccess) {
          console.log('TOTP認証成功！');
          authCookie = authResult.authCookie;
        } else {
          console.log('TOTP認証失敗');
        }
      } else {
        console.log('TOTPによる認証はサポートされていません');
      }
    } 
    else {
      // 認証失敗
      console.log('認証失敗:', authResult.errorMessage);
    }

    // ステップ3: 認証クッキーを使用したAPI呼び出し
    if (authCookie) {
      console.log('認証クッキーを使用してAPIを呼び出し中...');

      const client = authCookie.createClient();
      const response = await client.get('https://vrchat.com/api/1/auth/user');

      if (response.ok) {
        const userData = await response.json();
        console.log('ユーザー情報取得成功:', userData);
        return userData;
      } else {
        console.log('ユーザー情報取得失敗:', response.status);
      }
    }
  } catch (error) {
    console.error('処理中にエラーが発生しました:', error);
  }

  return null;
}
```

これらの例を参考に、LoginVRChatAccountライブラリを使用してVRChatアカウントの認証機能を実装してください。
