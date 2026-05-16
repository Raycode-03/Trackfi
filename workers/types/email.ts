export interface EmailJob {
  email: string;
  name?: string;
  subject?: string;
  html?: string;
}

export interface EmailResponse {
  success: boolean;
  id?: string;
  error?: string;
}
