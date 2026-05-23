import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdatePlanProgressDto {
  @IsInt()
  @Min(1)
  dayNumber!: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
