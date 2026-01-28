import { Controller, Get, Param } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { TravelService } from '../travel/travel.service';
import { ExpenseService } from '../expense/expense.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly authService: AuthService,
    private readonly travelService: TravelService,
    private readonly expenseService: ExpenseService,
  ) {}

  @Get('data/:token')
  async getDashboardData(@Param('token') token: string) {
    // Verifica e decodifica token
    const { userId } = await this.authService.verifyDashboardToken(token);

    // Busca dados
    const trips = await this.travelService.findAll(userId);
    const allExpenses = await Promise.all(
      trips.map(trip => this.expenseService.findAll(trip.id))
    );
    const expenses = allExpenses.flat();

    // Calcula estatisticas
    const totalBudget = trips.reduce((sum, t) => sum + Number(t.estimatedBudget || 0), 0);
    const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const nextTrip = trips.find(t => new Date(t.startDate) > new Date());

    return {
      userId,
      trips: trips.map(t => ({
        ...t,
        expenses: expenses.filter(e => e.tripId === t.id),
        spent: expenses
          .filter(e => e.tripId === t.id)
          .reduce((sum, e) => sum + Number(e.amount), 0),
      })),
      stats: {
        totalTrips: trips.length,
        totalBudget,
        totalSpent,
        savings: totalBudget - totalSpent,
        savingsPercent: totalBudget > 0 ? ((totalBudget - totalSpent) / totalBudget * 100) : 0,
        nextTrip: nextTrip ? {
          destination: nextTrip.destination,
          startDate: nextTrip.startDate,
        } : null,
      },
    };
  }
}
