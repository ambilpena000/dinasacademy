import {
  IsInt, IsString, IsOptional, IsBoolean, IsIn, Min, Max, IsNotEmpty, ValidateIf,
  IsArray, ValidateNested, ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JENJANG, PEMINATAN } from './major.entity';

export class CreateUniversityDto {
  @IsInt() @Min(1)
  id!: number;

  @IsString() @IsNotEmpty()
  name!: string;

  @IsOptional() @IsString()
  shortName?: string | null;

  @IsOptional() @IsString()
  province?: string | null;

  @IsOptional() @IsString()
  city?: string | null;

  @IsOptional() @IsIn(['Akademik', 'Vokasi', 'PTKIN'])
  kategori?: string;

  @IsOptional() @IsBoolean()
  isPtnBh?: boolean;

  @IsOptional() @IsString()
  website?: string | null;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class UpdateUniversityDto {
  @IsOptional() @IsString() @IsNotEmpty()
  name?: string;

  @IsOptional() @IsString()
  shortName?: string | null;

  @IsOptional() @IsString()
  province?: string | null;

  @IsOptional() @IsString()
  city?: string | null;

  @IsOptional() @IsIn(['Akademik', 'Vokasi', 'PTKIN'])
  kategori?: string;

  @IsOptional() @IsBoolean()
  isPtnBh?: boolean;

  @IsOptional() @IsString()
  website?: string | null;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class CreateMajorDto {
  @IsInt() @Min(1)
  id!: number;

  @IsInt() @Min(1)
  universityId!: number;

  @IsString() @IsNotEmpty()
  name!: string;

  @IsOptional() @IsIn(JENJANG as unknown as string[])
  jenjang?: string;

  @IsOptional() @ValidateIf((_, v) => v !== null) @IsIn(PEMINATAN as unknown as string[])
  peminatan?: string | null;

  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt() @Min(0) @Max(1000)
  passingGrade?: number | null;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class UpdateMajorDto {
  @IsOptional() @IsString() @IsNotEmpty()
  name?: string;

  @IsOptional() @IsIn(JENJANG as unknown as string[])
  jenjang?: string;

  @IsOptional() @ValidateIf((_, v) => v !== null) @IsIn(PEMINATAN as unknown as string[])
  peminatan?: string | null;

  @IsOptional() @ValidateIf((_, v) => v !== null) @IsInt() @Min(0) @Max(1000)
  passingGrade?: number | null;

  @IsOptional() @IsBoolean()
  isActive?: boolean;
}

export class PassingGradeRowDto {
  @IsInt() @Min(1)
  id!: number;

  @ValidateIf((_, v) => v !== null) @IsInt() @Min(0) @Max(1000)
  passingGrade!: number | null;
}

export class ImportPassingGradeDto {
  @IsArray() @ArrayMaxSize(10000)
  @ValidateNested({ each: true })
  @Type(() => PassingGradeRowDto)
  rows!: PassingGradeRowDto[];
}
