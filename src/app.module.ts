import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppDataSource } from './db/typeorm.config';
import { AuthModule } from './modules/auth/auth.module'; 

@Module({
  imports: [
    TypeOrmModule.forRoot(AppDataSource.options), // ✅ Use shared config
    AuthModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
