import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// import bcrypt from 'bcrypt'
@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

}
