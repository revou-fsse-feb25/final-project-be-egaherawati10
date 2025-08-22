import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    { provide: 'IUsersRepository', useClass: UsersRepository },
    { provide: 'IUsersService', useExisting: UsersService },
  ],
  exports: ['IUsersRepository', 'IUsersService'],
})
export class UsersModule {}