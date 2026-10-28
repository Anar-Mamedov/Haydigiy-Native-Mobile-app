export interface User {
  id: string;
  email: string;
  name: string;
  surname?: string;
  phoneNumber?: string;
  /** Saved birth date as "YYYY-MM-DD"; feeds the Insider `birthday` attribute. */
  birthDate?: string | null;
  /** Whether the account e-mail is verified; drives the "DOĞRULA" prompt. */
  emailVerified?: boolean;
}
