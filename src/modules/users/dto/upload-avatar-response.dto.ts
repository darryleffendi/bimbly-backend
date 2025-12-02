export class UploadAvatarResponseDto {
  message: string;
  profileImageUrl: string;

  constructor(profileImageUrl: string) {
    this.message = 'Avatar uploaded successfully';
    this.profileImageUrl = profileImageUrl;
  }
}
