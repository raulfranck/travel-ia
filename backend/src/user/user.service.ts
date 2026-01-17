import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserPlan } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create({
      ...createUserDto,
      referralCode: this.generateReferralCode(),
    });
    return this.userRepository.save(user);
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['trips'],
    });

    if (!user) {
      throw new NotFoundException(`Usuário ${id} não encontrado`);
    }

    return user;
  }

  async findByWhatsappHash(whatsappHash: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { whatsappHash } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async giveConsent(id: string): Promise<User> {
    return this.update(id, { hasConsented: true });
  }

  async canCreateTrip(userId: string): Promise<boolean> {
    const user = await this.findOne(userId);

    const limits = {
      [UserPlan.FREE]: parseInt(process.env.FREE_PLAN_TRIPS_LIMIT || '1', 10),
      [UserPlan.BASIC]: parseInt(process.env.BASIC_PLAN_TRIPS_LIMIT || '10', 10),
      [UserPlan.PRO]: parseInt(process.env.PRO_PLAN_TRIPS_LIMIT || '999', 10),
    };

    return user.tripsThisMonth < limits[user.plan];
  }

  async incrementTripCount(userId: string): Promise<void> {
    await this.userRepository.increment({ id: userId }, 'tripsThisMonth', 1);
  }

  async resetMonthlyTripCounts(): Promise<void> {
    await this.userRepository.update({}, { tripsThisMonth: 0 });
  }

  async getUserStats(userId: string) {
    const user = await this.findOne(userId);

    return {
      plan: user.plan,
      tripsThisMonth: user.tripsThisMonth,
      totalTrips: user.trips?.length || 0,
      memberSince: user.createdAt,
      referralCode: user.referralCode,
    };
  }

  private generateReferralCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  }
}

