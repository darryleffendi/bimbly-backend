import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { TutorsService } from './tutors.service';
import { CreateTutorProfileDto } from './dto/create-tutor-profile.dto';
import { UpdateTutorProfileDto } from './dto/update-tutor-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

const certificationStorage = diskStorage({
  destination: './uploads/certifications',
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  },
});

@Controller('tutors')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TutorsController {
  constructor(private tutorsService: TutorsService) {}

  @Get('profile')
  @Roles('tutor')
  async getProfile(@Request() req) {
    const profile = await this.tutorsService.getOrCreateProfile(req.user.id);
    return profile;
  }

  @Post('profile')
  @Roles('tutor')
  @HttpCode(HttpStatus.CREATED)
  async createProfile(@Request() req, @Body() createDto: CreateTutorProfileDto) {
    return this.tutorsService.createProfile(req.user.id, createDto);
  }

  @Patch('profile')
  @Roles('tutor')
  async updateProfile(@Request() req, @Body() updateDto: UpdateTutorProfileDto) {
    return this.tutorsService.updateProfile(req.user.id, updateDto);
  }

  @Post('upload-certification')
  @Roles('tutor')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: certificationStorage,
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|pdf)$/)) {
          return cb(new BadRequestException('Only JPG, PNG, and PDF files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadCertification(
    @Request() req,
    @UploadedFile() file: Express.Multer.File,
    @Body('certificationName') certificationName: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!certificationName) {
      throw new BadRequestException('Certification name is required');
    }

    const fileUrl = `/uploads/certifications/${file.filename}`;
    const profile = await this.tutorsService.uploadCertification(req.user.id, certificationName, fileUrl);

    return {
      message: 'Certification uploaded successfully',
      certification: { name: certificationName, fileUrl },
      profile,
    };
  }
}
