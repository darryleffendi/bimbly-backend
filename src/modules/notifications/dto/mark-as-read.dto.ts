import { IsUUID, IsArray, IsOptional } from 'class-validator';

export class MarkAsReadDto {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  notificationIds?: string[];
}
