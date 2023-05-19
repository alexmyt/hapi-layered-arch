import { Request, ResponseToolkit, ServerRoute, Lifecycle } from '@hapi/hapi';

import UserRegisterDTO from './dto/user.register.dto';
import UserLoginDTO from './dto/user.login.dto';

export default interface IUserController {
  routes: ServerRoute[];

  register: (
    req: Request<{ Payload: UserRegisterDTO }>,
    res: ResponseToolkit,
  ) => Promise<Lifecycle.ReturnValue>;

  login: (
    req: Request<{ Payload: UserLoginDTO }>,
    res: ResponseToolkit,
  ) => Promise<Lifecycle.ReturnValue>;
}
