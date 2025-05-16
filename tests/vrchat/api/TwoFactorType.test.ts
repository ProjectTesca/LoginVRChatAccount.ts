import { TwoFactorType, parseTwoFactorType } from '../../../src/vrchat/api/TwoFactorType';

describe('TwoFactorType', () => {
  /**
   * parseTwoFactorType
   * - 有効な文字列から正しいTwoFactorTypeに変換されるかをテストします。
   */
  test('parse_valid_types', () => {
    expect(parseTwoFactorType('emailOtp')).toBe(TwoFactorType.EmailOtp);
    expect(parseTwoFactorType('totp')).toBe(TwoFactorType.Totp);
    expect(parseTwoFactorType('otp')).toBe(TwoFactorType.Otp);
  });

  /**
   * parseTwoFactorType
   * - 無効な文字列からInvalidに変換されるかをテストします。
   */
  test('parse_invalid_types', () => {
    expect(parseTwoFactorType('')).toBe(TwoFactorType.Invalid);
    expect(parseTwoFactorType('invalid')).toBe(TwoFactorType.Invalid);
    expect(parseTwoFactorType('unknown')).toBe(TwoFactorType.Invalid);
    expect(parseTwoFactorType('TOTP')).toBe(TwoFactorType.Invalid); // 大文字は無効
    expect(parseTwoFactorType('emailotp')).toBe(TwoFactorType.Invalid); // 大文字小文字が異なる
  });

  /**
   * TwoFactorType enum values
   * - 列挙型の値が正しいかをテストします。
   */
  test('enum_values', () => {
    expect(TwoFactorType.Invalid).toBe('invalid');
    expect(TwoFactorType.EmailOtp).toBe('emailOtp');
    expect(TwoFactorType.Totp).toBe('totp');
    expect(TwoFactorType.Otp).toBe('otp');
  });
});