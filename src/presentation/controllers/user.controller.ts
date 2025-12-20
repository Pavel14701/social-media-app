// presentation/controllers/user.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { UserService } from '../../application/services/user.service';
import { UserDm } from '../../domain/entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async create(@Body() schema: CreateUserSchema): Promise<UserDm> {
    const user = new UserDm('', schema.username, schema.email, schema.password, schema.biography, schema.isAdmin);
    return this.userService.create(user);
  }

  @Get(':username')
  async getUser(@Param('username') username: string): Promise<UserDm | null> {
    return this.userService.findByUsername(username);
  }
}
