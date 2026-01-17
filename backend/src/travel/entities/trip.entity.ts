import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Expense } from '../../expense/entities/expense.entity';

export enum TripStatus {
  DRAFT = 'draft',
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('trips')
export class Trip {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.trips)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  destination: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'int' })
  numberOfPeople: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  estimatedBudget: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  actualSpent: number;

  @Column({ type: 'text', nullable: true })
  itinerary: string;

  @Column({ type: 'jsonb', nullable: true })
  itineraryData: Record<string, any>;

  @Column({ type: 'enum', enum: TripStatus, default: TripStatus.DRAFT })
  status: TripStatus;

  @Column({ type: 'jsonb', nullable: true })
  bookingLinks: Record<string, any>;

  @OneToMany(() => Expense, (expense) => expense.trip)
  expenses: Expense[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

