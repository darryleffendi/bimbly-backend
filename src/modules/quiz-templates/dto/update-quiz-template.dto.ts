import { PartialType } from '@nestjs/mapped-types';
import { CreateQuizTemplateDto } from './create-quiz-template.dto';

export class UpdateQuizTemplateDto extends PartialType(CreateQuizTemplateDto) {}
