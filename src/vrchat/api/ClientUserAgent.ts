/**
 * VRChatにリクエストを送る際に必要なユーザーエージェント
 */
export class ClientUserAgent {
  private applicationName: string;
  private version: string;
  private contactInfo?: string;

  /**
   * コンストラクタ
   * @param applicationName アプリケーション名
   * @param version バージョン
   * @param contactInfo 連絡先などの問い合わせ先（オプション）
   */
  constructor(applicationName: string, version: string, contactInfo?: string) {
    this.applicationName = applicationName;
    this.version = version;
    this.contactInfo = contactInfo;
  }

  /**
   * ヘッダーに使用する文字列を取得します
   * @returns ヘッダー用の文字列
   */
  toHeaderString(): string {
    // 連絡先が設定されている場合は語尾に連絡先を載せます
    if (this.contactInfo) {
      return `${this.applicationName}/${this.version} ${this.contactInfo}`;
    } else {
      return `${this.applicationName}/${this.version}`;
    }
  }
}