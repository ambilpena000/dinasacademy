import { Controller, Get, Post, Body, Param, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  findAll(@Query('tryoutId') tryoutId?: string) {
    return this.questionsService.findAll(tryoutId ? parseInt(tryoutId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(parseInt(id));
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: any) {
    return this.questionsService.processFile(file);
  }
}