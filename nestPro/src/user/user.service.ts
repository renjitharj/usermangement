import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt'
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private userRepo: Repository<User>,
  private jwtService: JwtService
  ) {}
  findAll(): Promise<User[]> {
    return this.userRepo.find();
  }

  async findByUsername(email: string): Promise<User> {
    return this.userRepo.findOne({ where:{email} });
  }

  async create(newUser){
    // const salt = await bcrypt.genSalt();
    const salt=10
    const hashedPassword = await bcrypt.hash(newUser.password, salt);
    newUser.password = hashedPassword;
   return this.userRepo.save(newUser)
   
   }

   
   async login(email:string,password :string): Promise<{ user: User, token: string }> {
    console.log(email,password);
    
    const user = await this.findByUsername(email);
    if (!user) {
      throw new Error('Invalid user credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new Error('Invalid pw credentials');
    }
    const payload = {sub: user.id };
    const token = this.jwtService.sign(payload,{
      secret:jwtConstants.secret
    })
    return {user,token};
  }

  async updateUser(userId: number, updatedFields: Partial<User>): Promise<User> {
    const user = await this.userRepo.findOne({
      where: { id: Number(userId) },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Update the user's fields
    // Object.assign(user, updatedFields);
    Object.keys(updatedFields).forEach(async(key) => {
      if (key === 'password') {
        // Hash the password using bcrypt and update the user object
        const salt = 10;
        const hashedPassword = await bcrypt.hash(updatedFields[key], salt);
        user[key] = hashedPassword;
      } else {
        user[key] = updatedFields[key];
      }
    });

    return this.userRepo.save(user);
  }

  async getUserFromToken(token: string): Promise<User> {
    const tokenWithoutPrefix = token.split(' ')[1]
    
    const decoded = this.jwtService.verify(tokenWithoutPrefix, {
      secret: jwtConstants.secret,
    });
    
    const user = await this.userRepo.findOne({
      where: { id: decoded.sub },
    });
    if (!user) {
      throw new Error('User not found');
    }
    return user
}
}