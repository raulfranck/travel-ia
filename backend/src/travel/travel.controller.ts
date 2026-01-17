import { Controller, Get, Post, Body, Param, Patch, Query } from '@nestjs/common';
import { TravelService } from './travel.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Controller('trips')
export class TravelController {
  constructor(private readonly travelService: TravelService) {}

  @Post()
  create(@Body() createTripDto: CreateTripDto) {
    return this.travelService.createTrip(createTripDto);
  }

  @Get()
  findAll(@Query('userId') userId: string) {
    return this.travelService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.travelService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTripDto: UpdateTripDto) {
    return this.travelService.update(id, updateTripDto);
  }

  @Post(':id/generate-itinerary')
  generateItinerary(@Param('id') id: string) {
    return this.travelService.generateItinerary(id);
  }

  @Get(':id/export/pdf')
  exportPdf(@Param('id') id: string) {
    return this.travelService.exportToPdf(id);
  }
}

