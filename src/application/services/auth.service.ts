import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { UserService } from './user.service';
import { User } from '../../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UserService) {}

  async register(username: string, email: string, password: string) {
    if (!(username && email && password)) {
      throw new Error('All input required');
    }

    const normalizedEmail = email.toLowerCase();

    const existingUser = await this.userService.findByEmail(normalizedEmail);
    if (existingUser) throw new Error('Email already exists');

    const existingByUsername = await this.userService.findByUsername(username);
    if (existingByUsername) throw new Error('Username already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userService.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, process.env.TOKEN_KEY!);

    return { token, username: user.username, userId: user.id, isAdmin: user.isAdmin };
  }

  async login(email: string, password: string) {
    if (!(email && password)) {
      throw new Error('All input required');
    }

    const normalizedEmail = email.toLowerCase();
    const user = await this.userService.findByEmail(normalizedEmail);

    if (!user) throw new Error('Email or password incorrect');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Email or password incorrect');

    const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, process.env.TOKEN_KEY!);

    return { token, username: user.username, userId: user.id, isAdmin: user.isAdmin };
  }
}
