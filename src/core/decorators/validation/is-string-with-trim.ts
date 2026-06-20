import { applyDecorators } from '@nestjs/common';
import { IsString, Length } from 'class-validator';
import { Trim } from '../transform/trim';

export const IsStringWithTrim = (params: { min: number; max: number }) =>
  applyDecorators(IsString(), Length(params.min, params.max), Trim);
