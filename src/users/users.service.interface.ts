import UserLoginDTO from './dto/user.login.dto';
import UserRegisterDTO from './dto/user.register.dto';
import User from './user.entity';

export default interface IUsersService {
  createUser: (dto: UserRegisterDTO) => Promise<User | null>;
  login: (dto: UserLoginDTO) => Promise<User | null>;
  info: (userId: User['id']) => Promise<User | null>;
  deleteUser: (userId: User['id']) => Promise<User | null>;
}
