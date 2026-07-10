import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ example: 120.50, description: 'Amount of the expense' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiPropertyOptional({ example: 'USD', description: 'Currency code', default: 'USD' })
  @IsString()
  @IsOptional()
  currency?: string;

  @ApiProperty({ example: '2026-07-07', description: 'Date the expense occurred' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 'Client lunch at Olive Garden', description: 'Description of the expense' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'uuid-string', description: 'Optional Category ID' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}
