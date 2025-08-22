import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PatientsService } from './patients.service';
import { PatientsRepository } from './patients.repository';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    PrismaModule,
    forwardRef(() => UsersModule),
  ],
  providers: [
    PatientsRepository,
    PatientsService,
    { provide: 'IPatientsRepository', useExisting: PatientsRepository }, // ⬅️ bind token
    { provide: 'IPatientsService', useExisting: PatientsService },       // optional export token
  ],
  exports: ['IPatientsService'], // optional: if other modules need it
  controllers: [/* PatientsController */],
})
export class PatientsModule {}