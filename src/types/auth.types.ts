export interface User {
  id: string;
  email: string;
  name: string;
  surname?: string;
  phoneNumber?: string;
  /**
   * The phone number in E.164 (`+905321234567`) exactly as the backend formats it
   * (`phone_e164`); the single source of the phone sent to Insider. Sessions stored
   * before the backend returned it have no value.
   */
  phoneE164?: string | null;
  /** Saved birth date as "YYYY-MM-DD"; feeds the Insider `birthday` attribute. */
  birthDate?: string | null;
  /** Whether the account e-mail is verified; drives the "DOĞRULA" prompt. */
  emailVerified?: boolean;
}
