import { IsInt, IsString, Min, Max, MinLength, MaxLength } from 'class-validator';

export class CreateStudentProfileDto {
  @IsInt({ message: 'Current grade must be an integer' })
  @Min(1, { message: 'Grade must be at least 1' })
  @Max(12, { message: 'Grade must be at most 12' })
  currentGrade: number;

  @IsString({ message: 'School name must be a string' })
  @MinLength(3, { message: 'School name must be at least 3 characters' })
  @MaxLength(100, { message: 'School name must be at most 100 characters' })
  schoolName: string;

  @IsString({ message: 'Address must be a string' })
  @MaxLength(200, { message: 'Address must be at most 200 characters' })
  address?: string;
}
