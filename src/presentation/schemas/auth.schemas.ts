import { IsString, IsEmail, MinLength, Matches } from 'class-validator';


export class RegisterSchema {
  @IsString()
  username!: string;

  @IsString()
  @MinLength(8, { message: 'Пароль должен быть не короче 8 символов' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=]).+$/, {
    message:
      'Пароль должен содержать хотя бы одну заглавную букву, одну строчную букву, одну цифру и один спецсимвол',
  })
  password!: string;

  @IsEmail()
  email!: string;
}

export class LoginSchema {
  @IsString()
  username!: string;

  @IsString()
  password!: string;
}

export class LogoutSchema {
  @IsString()
  userId!: string;
}

export class RefreshSchema {
  @IsString()
  refreshToken!: string;
}
