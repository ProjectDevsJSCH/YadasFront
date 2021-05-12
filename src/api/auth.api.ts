import axios from '@/config/http-common';

export abstract class AuthApi {
  static async setPassword(password: string, resetToken: string) {
    const body = {
      password,
      resetToken,
    };

    await axios.post('/auth/password-set', body);
  }
}
