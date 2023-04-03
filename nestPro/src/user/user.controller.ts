import { Controller, Get, Post,Body, HttpCode,UseGuards,Req  } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
// import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('all')
  async getAll(): Promise<User[]> {
    return await this.userService.findAll();
  }

  @Post('add')
  @HttpCode(201)
  createUser(@Body() newUser: any) {
    this.userService.create(newUser);
  }

  @Post('login')
  async login(@Body() user: User): Promise<any> {

    try {
      const { user: loggedInUser, token } = await this.userService.login(user.email, user.password);
      return {
        data: {name:loggedInUser.name,email:loggedInUser.email},
        token:token,
        status: true
      };
    } catch (error) {
      return {
        data: null,
        status: false
      };
    }

    
  }


  @Post('update')
  @UseGuards(JwtAuthGuard)
  async updateUser(@Body() updatedFields: Partial<User>, @Req() req: any): Promise<any> {
    try {
      const user = await this.userService.getUserFromToken(req.headers.authorization);
      console.log(req,"rrr");
      
      console.log(req.user.userId,"idddd");
      
      if (user.id !== req.user.userId) {
        return {
          data: null,
          status: false,
          message: 'User ID in token does not match requested user ID',
        };
      }

      const updatedUser = await this.userService.updateUser(req.user.userId, updatedFields);
      return {
        data: updatedUser,
        status: true,
        message: 'User updated successfully',
      };
    } catch (error) {
      console.log(error);
      
      return {
        data: null,
        status: false,
       
      }

    }
  }
}