export interface LoginResponse {
  accessToken: string;
  expiresIn?: number;
  user?: any; // replace `any` with your User type if you have it
}