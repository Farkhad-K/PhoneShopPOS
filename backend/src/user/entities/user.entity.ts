// entities/user.entity.ts
import { Extender } from 'src/common/entities/common.entities';
import { Role } from 'src/common/enums/enum';
import { Column, Entity } from 'typeorm';

@Entity({ name: 'user' })
export class User extends Extender {
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @Column({ default: 0 })
  refreshTokenVersion: number;
}
