import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Trip } from '../../travel/entities/trip.entity';

export enum UserPlan {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  whatsappHash: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'enum', enum: UserPlan, default: UserPlan.FREE })
  plan: UserPlan;

  @Column({ default: 0 })
  tripsThisMonth: number;

  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ nullable: true })
  stripeSubscriptionId: string;

  @Column({ nullable: true })
  referralCode: string;

  @Column({ default: false })
  hasConsented: boolean;

  @Column({ type: 'jsonb', nullable: true })
  preferences: Record<string, any>;

  @OneToMany(() => Trip, (trip) => trip.user)
  trips: Trip[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

