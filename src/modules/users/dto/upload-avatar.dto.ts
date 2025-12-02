import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class UploadAvatarDto {
  @IsNotEmpty({ message: 'Base64 image is required' })
  @IsString({ message: 'Base64 image must be a string' })
  @Matches(/^data:image\/(jpeg|jpg|png|gif|webp);base64,/, {
    message: 'Invalid base64 image format. Must be a valid image type (jpeg, jpg, png, gif, webp)',
  })
  base64Image: string;
}
