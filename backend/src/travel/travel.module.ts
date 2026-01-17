import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelController } from './travel.controller';
import { TravelService } from './travel.service';
import { AiService } from './ai.service';
import { Trip } from './entities/trip.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trip])],
  controllers: [TravelController],
  providers: [TravelService, AiService],
  exports: [TravelService],
})
export class TravelModule {}

