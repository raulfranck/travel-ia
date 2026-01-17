import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trip } from './entities/trip.entity';
import { AiService } from './ai.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

@Injectable()
export class TravelService {
  constructor(
    @InjectRepository(Trip)
    private readonly tripRepository: Repository<Trip>,
    private readonly aiService: AiService,
  ) {}

  async createTrip(createTripDto: CreateTripDto): Promise<Trip> {
    const trip = this.tripRepository.create(createTripDto);
    return this.tripRepository.save(trip);
  }

  async findAll(userId?: string): Promise<Trip[]> {
    const where = userId ? { userId } : {};
    return this.tripRepository.find({
      where,
      relations: ['user', 'expenses'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Trip> {
    const trip = await this.tripRepository.findOne({
      where: { id },
      relations: ['user', 'expenses'],
    });

    if (!trip) {
      throw new NotFoundException(`Viagem ${id} não encontrada`);
    }

    return trip;
  }

  async update(id: string, updateTripDto: UpdateTripDto): Promise<Trip> {
    await this.tripRepository.update(id, updateTripDto);
    return this.findOne(id);
  }

  async generateItinerary(tripId: string): Promise<Trip> {
    const trip = await this.findOne(tripId);

    // Gera roteiro usando IA
    const itinerary = await this.aiService.generateItinerary({
      destination: trip.destination,
      startDate: trip.startDate,
      endDate: trip.endDate,
      numberOfPeople: trip.numberOfPeople,
      budget: trip.estimatedBudget,
    });

    // Salva roteiro
    trip.itinerary = itinerary.text;
    trip.itineraryData = itinerary.structured;

    return this.tripRepository.save(trip);
  }

  async exportToPdf(tripId: string): Promise<{ url: string }> {
    const trip = await this.findOne(tripId);
    // Implementar geração de PDF (ex: usando puppeteer ou pdfkit)
    return {
      url: `https://api.travelbot.com/exports/${tripId}.pdf`,
    };
  }

  async calculateTotalExpenses(tripId: string): Promise<number> {
    const trip = await this.findOne(tripId);
    return trip.expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  }
}

