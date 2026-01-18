import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.create(createExpenseDto);
  }

  @Get()
  findAll(@Query('tripId') tripId: string) {
    return this.expenseService.findAll(tripId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expenseService.findOne(id);
  }

  @Post('ocr')
  async processReceipt(@Body() body: { imageUrl: string; tripId: string }) {
    return this.expenseService.processReceipt(body.imageUrl, body.tripId);
  }
}

