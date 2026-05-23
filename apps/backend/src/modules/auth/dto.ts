import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsEnum(['ORTHODOX', 'CATHOLIC', 'PROTESTANT', 'GENERAL'])
  denomination?: 'ORTHODOX' | 'CATHOLIC' | 'PROTESTANT' | 'GENERAL';
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
