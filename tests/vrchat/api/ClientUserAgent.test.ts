import { ClientUserAgent } from '../../../src/vrchat/api/ClientUserAgent';

describe('ClientUserAgent', () => {
  /**
   * ClientUserAgent.constructor ClientUserAgent.toHeaderString
   * - 必須の引数を用いて、正常な値を出力するかをテストします。
   */
  test('simple_header_test', () => {
    // 構造体作成時に渡す値
    const applicationName = "SIMPLE_TEST";
    const version = "0.1.0";
    // 期待する結果
    const expectResult = "SIMPLE_TEST/0.1.0";

    // テストを行う
    const userAgent = new ClientUserAgent(applicationName, version);
    expect(userAgent.toHeaderString()).toBe(expectResult);
  });

  /**
   * ClientUserAgent.constructor ClientUserAgent.toHeaderString
   * - すべての引数を用いて、正常な値を出力するかをテストします。
   */
  test('with_contact_info_test', () => {
    // 構造体作成時に渡す値
    const applicationName = "SIMPLE_TEST";
    const version = "0.1.0";
    const contactInfo = "test@azte.studio";
    // 期待する結果
    const expectResult = "SIMPLE_TEST/0.1.0 test@azte.studio";

    // テストを行う
    const userAgent = new ClientUserAgent(applicationName, version, contactInfo);
    expect(userAgent.toHeaderString()).toBe(expectResult);
  });
});