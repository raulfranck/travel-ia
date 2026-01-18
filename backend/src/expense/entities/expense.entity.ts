import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Trip } from '../../travel/entities/trip.entity';

export enum ExpenseCategory {
  ACCOMMODATION = 'accommodation',
  TRANSPORTATION = 'transportation',
  FOOD = 'food',
  ENTERTAINMENT = 'entertainment',
  SHOPPING = 'shopping',
  OTHER = 'other',
}

@Entity('expenses')
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tripId: string;

  @ManyToOne(() => Trip, (trip) => trip.expenses)
  @JoinColumn({ name: 'tripId' })
  trip: Trip;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({ type: 'enum', enum: ExpenseCategory })
  category: ExpenseCategory;

  @Column()
  description: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true })
  receiptUrl: string;

  @Column({ type: 'text', nullable: true })
  ocrText: string;

  @CreateDateColumn()
  createdAt: Date;
}

