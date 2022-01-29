import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsBoolean, IsString, Length } from 'class-validator';
import { User } from './user.entity';

@Entity()
export class Tweet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @Length(1, 140, { message: 'contents: 1 ~ 140글자를 입력해주세요.' })
  contents: string;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;

  @Column({ default: true })
  @IsBoolean()
  activate?: boolean;

  @ManyToOne((type) => User, (user) => user.tweets, { eager: true })
  user: User;
}
