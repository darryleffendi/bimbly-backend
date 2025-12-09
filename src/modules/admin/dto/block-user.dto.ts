import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class BlockUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Block reason must be at least 10 characters long' })
  blockReason: string;
}
