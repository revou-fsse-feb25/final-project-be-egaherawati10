import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PatientsService } from './patients.service';
import { PatientsRepository } from './patients.repository';
import { UsersModule } from '../users/users.module';
import { PatientsController } from './patients.controller';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => UsersModule),
  ],
  providers: [
    PatientsRepository,
    PatientsService,
    { provide: 'IPatientsRepository', useExisting: PatientsRepository },
    { provide: 'IPatientsService', useExisting: PatientsService },
  ],
  exports: ['IPatientsService'],
  controllers: [PatientsController],
})
export class PatientsModule {}