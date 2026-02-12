import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from 'src/user/entities/user.entity';
import { AuthBaseService } from './auth-base.service';

@Injectable()
export class AuthValidateService extends AuthBaseService {
  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersRepo.findOne({ where: { username } });
    if (!user || user.isActive === false) return null;

    const ok = await bcrypt.compare(password, user.password);
    return ok ? user : null;
  }
}
