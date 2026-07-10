import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Travel', description: 'The name of the expense category' })
  @IsString()
  @IsNotEmpty()
  name: string;
}
