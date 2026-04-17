

interface OtpRequest {
  email: string;
}

interface OtpVerifyRequest {
  email: string;
  otp: string;
}

import { getApiUrl } from '@/utils/apiClient';

export class OtpService {
  private static get baseUrl() { return getApiUrl(); }

  static async requestOtp(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/security/request-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error requesting OTP:', error);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.',
      };
    }
  }

  static async verifyOtp(email: string, otp: string): Promise<{ success: boolean; message: string; token?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/security/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Failed to verify OTP. Please try again.',
      };
    }
  }
}