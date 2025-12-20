import { PartialType } from '@nestjs/mapped-types';
import { CreateTutorProfileDto } from './create-tutor-profile.dto';


export class UpdateTutorProfileDto extends PartialType(CreateTutorProfileDto) {

}
