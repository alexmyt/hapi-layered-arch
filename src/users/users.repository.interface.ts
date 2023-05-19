import User from './user.entity';

export default interface IUsersRepository {
  create: (user: User) => Promise<User>;
  findByEmail: (email: string) => Promise<User | null>;
  findById: (id: User['id']) => Promise<User | null>;
  deleteById: (id: User['id']) => Promise<User | null>;
  deleteByEmail: (email: string) => Promise<User | null>;
}
