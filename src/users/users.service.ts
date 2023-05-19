import { inject, injectable } from 'inversify';

import TYPES from '../ioc/types';

import UserRegisterDTO from './dto/user.register.dto';
import UserLoginDTO from './dto/user.login.dto';
import IUsersService from './users.service.interface';
import IUsersRepository from './users.repository.interface';
import User from './user.entity';

@injectable()
export default class UsersService implements IUsersService {
  constructor(@inject(TYPES.UsersRepository) private userRepository: IUsersRepository) {}

  async createUser({ email, name, password }: UserRegisterDTO): Promise<User | null> {
    const existedUser = await this.userRepository.findByEmail(email);
    if (existedUser) {
      return null;
    }

    const newUser = new User({ email, name });
    await newUser.setPassword(password);

    const result = await this.userRepository.create(newUser);
    return result;
  }

  async login({ email, password }: UserLoginDTO): Promise<User | null> {
    const existedUser = await this.userRepository.findByEmail(email);
    if (!existedUser) {
      return null;
    }

    const result = await existedUser.comparePassword(password);
    if (result) {
      return existedUser;
    }
    return null;
  }

  async info(userId: User['id']): Promise<User | null> {
    const existedUser = await this.userRepository.findById(userId);

    return existedUser;
  }

  async deleteUser(userId: User['id']): Promise<User | null> {
    const existedUser = await this.userRepository.deleteById(userId);
    return existedUser;
  }
}
