// src/users/users.controller.ts
import { Controller, Get, Post, Patch, Delete, Param, Body, Query, ParseIntPipe, Inject } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { IUsersService } from './users.service.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { Can } from 'src/common/guards/can.decorator';

export const USERS_SERVICE = 'IUsersService' as const; // optional: centralize token

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    @Inject(USERS_SERVICE) private readonly service: IUsersService, // ✅ inject by token
  ) {}

  @Get()
  @Can('User', 'read')
  findAll(@Query() q: QueryUserDto) { return this.service.findMany(q); }

  @Get(':id')
  @Can('User', 'read')
  findOne(@Param('id', ParseIntPipe) id: number) { return this.service.findById(id); }

  @Post()
  @Can('User', 'create')
  create(@Body() dto: CreateUserDto) { return this.service.create(dto); }

  @Patch(':id')
  @Can('User', 'update')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @Can('User', 'delete')
  remove(@Param('id', ParseIntPipe) id: number) { return this.service.delete(id); }
}