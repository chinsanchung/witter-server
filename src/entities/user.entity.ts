import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { InternalServerErrorException } from '@nestjs/common';
import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { Tweet } from './tweet.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @Length(5, 12, { message: 'user_id: 5 ~ 12 글자로 입력해주세요.' })
  user_id: string;

  @Column({ select: false })
  @IsString()
  @Length(5, 20, { message: 'password: 5 ~ 20 글자를 입력해주세요.' })
  password: string;

  @Column({ default: '' })
  @IsString()
  @MaxLength(50, { message: 'description: 50 글자 이내로 입력해주세요.' })
  @IsOptional()
  description?: string;

  @CreateDateColumn({ type: 'datetime', select: false })
  created_at: Date;

  @Column({ default: true })
  @IsBoolean()
  activate?: boolean;

  @ManyToOne((type) => Tweet, (tweet) => tweet.user)
  tweets?: Tweet[];

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        throw new InternalServerErrorException('비밀번호 암호화 오류');
      }
    }
  }
}
