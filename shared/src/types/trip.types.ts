export enum TripStatus {
  DRAFT = 'draft',
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export interface Trip {
  id: string;
  userId: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  numberOfPeople: number;
  estimatedBudget?: number;
  actualSpent: number;
  itinerary?: string;
  itineraryData?: ItineraryData;
  status: TripStatus;
  bookingLinks?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ItineraryData {
  days: number;
  dailyActivities: string[];
  estimatedCosts: {
    accommodation: number;
    transportation: number;
    food: number;
    activities: number;
  };
  tips: string[];
}

export interface CreateTripDto {
  userId: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  numberOfPeople: number;
  estimatedBudget?: number;
}

export interface UpdateTripDto {
  destination?: string;
  startDate?: Date;
  endDate?: Date;
  numberOfPeople?: number;
  estimatedBudget?: number;
  status?: TripStatus;
  itineraryData?: ItineraryData;
}

