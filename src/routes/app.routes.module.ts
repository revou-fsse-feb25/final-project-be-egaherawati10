import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { appRoutes } from './app.routes';

@Module({
  imports: [RouterModule.register(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutesModule {}