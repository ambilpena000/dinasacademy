import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { QuestionsService } from './questions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  // Frontend memanggil GET /questions/tryout/:tryoutId
  @Get('tryout/:tryoutId')
  findByTryout(@Param('tryoutId') tryoutId: string) {
    return this.questionsService.findAll(parseInt(tryoutId));
  }

  // POST /questions/upload (harus sebelum :id)
  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: any) {
    return this.questionsService.processFile(file);
  }

  @Get()
  findAll(@Query('tryoutId') tryoutId?: string) {
    return this.questionsService.findAll(tryoutId ? parseInt(tryoutId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.questionsService.findOne(parseInt(id));
  }

  // Admin CRUD
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: any) {
    return this.questionsService.create(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() body: any) {
    return this.questionsService.update(parseInt(id), body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.questionsService.remove(parseInt(id));
  }
}