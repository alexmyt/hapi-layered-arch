import { compare, hash } from 'bcrypt';

import AbstractEntity from '../common/abstract.entity';

interface IUserProps {
  name: string;
  email: string;
  password?: string;
}

export default class User extends AbstractEntity<IUserProps> {
  get email(): string {
    return this.props.email;
  }

  get name(): string {
    return this.props.name;
  }

  get password(): string | undefined {
    return this.props.password;
  }

  public async setPassword(password: string, saltRounds = 10): Promise<void> {
    this.props.password = await hash(password, saltRounds);
  }

  public async comparePassword(password: string): Promise<boolean> {
    if (this.props.password) {
      return compare(password, this.props.password);
    }
    return false;
  }
}
