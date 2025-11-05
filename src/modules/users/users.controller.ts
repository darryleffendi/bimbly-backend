import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('profile')
  async updateProfile(
    @Request() req,
    @Body() updateData: { fullName?: string; phoneNumber?: string },
  ) {
    return this.usersService.updateProfile(req.user.id, updateData);
  }

  @Post('upload-avatar')
  async uploadAvatar(@Request() req, @Body() body: { base64Image: string }) {
    if (!body.base64Image) {
      throw new BadRequestException('Base64 image is required');
    }

    if (!body.base64Image.startsWith('data:image/')) {
      throw new BadRequestException('Invalid base64 image format');
    }

    const user = await this.usersService.uploadAvatar(req.user.id, body.base64Image);

    return {
      message: 'Avatar uploaded successfully',
      profileImageUrl: user.profileImageUrl,
    };
  }
}
