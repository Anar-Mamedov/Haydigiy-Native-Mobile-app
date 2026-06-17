export interface User {
  id: string;
  email: string;
  name: string;
  surname?: string;
  phoneNumber?: string;
  /** Whether the account e-mail is verified; drives the "DOĞRULA" prompt. */
  emailVerified?: boolean;
}
