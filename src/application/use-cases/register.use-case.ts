import { Injectable } from "@nestjs/common";

@Injectable()
export class RegisterUserUseCase {
  constructor(private readonly userService: UserService) {}

  async execute(username: string, email: string, password: string) {
    if (!(username && email && password)) {
      throw new Error('All input required');
    }

    const normalizedEmail = email.toLowerCase();

    const existing = await this.userService.findByEmailOrUsername(normalizedEmail, username);
    if (existing) throw new Error('Email and username must be unique');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userService.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, process.env.TOKEN_KEY!);

    return { token, username: user.username, userId: user.id, isAdmin: user.isAdmin };
  }
}
