import axios from '@/config/http-common';

interface UserCreate {
  name: string;
  surname: string;
  enterprise: string;
  email: string;
  rol: string;
  password: string;
}

export abstract class UsersApi {
  static async createUser(user: UserCreate) {
    await axios.post('/auth/signup', user);
  }
}
