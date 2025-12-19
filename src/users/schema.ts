import { IsEmail, Length, Matches, MaxLength, IsBoolean } from "class-validator";

export class CreateUserDto {
  @Length(6, 30, { message: "Must be between 6 and 30 characters" })
  @Matches(/^\S*$/, { message: "Must contain no spaces" })
  username!: string;

  @IsEmail({}, { message: "Must be valid email address" })
  email!: string;

  @Length(8, 100, { message: "Must be at least 8 characters long" })
  password!: string;

  @MaxLength(250, { message: "Must be at most 250 characters long" })
  biography?: string;

  @IsBoolean()
  isAdmin?: boolean;
}
