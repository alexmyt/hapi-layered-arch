import { inject, injectable } from 'inversify';
import { Repository } from 'typeorm';

import UserEntity from '../database/entity/user';
import TYPES from '../ioc/types';
import TypeORMService from '../database/typeorm.service';

import User from './user.entity';
import IUsersRepository from './users.repository.interface';

@injectable()
export default class UsersRepository implements IUsersRepository {
  private userRepository: Repository<UserEntity>;

  constructor(@inject(TYPES.ORMService) private ormService: TypeORMService) {
    this.userRepository = this.ormService.dataSource.getRepository(UserEntity);
  }

  async create(user: User): Promise<User> {
    const result = await this.userRepository.save(user.props);
    return new User(result);
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.userRepository.findOne({ where: { email } });
    return result ? new User(result) : null;
  }

  async findById(id: User['id']): Promise<User | null> {
    const result = await this.userRepository.findOne({ where: { id } });
    return result ? new User(result) : null;
  }

  async deleteById(id: User['id']): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return null;
    }

    const result = await this.userRepository.remove(user);
    return result ? new User(result) : null;
  }

  async deleteByEmail(email: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      return null;
    }

    const result = await this.userRepository.remove(user);
    return result ? new User(result) : null;
  }
}
