import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { ImageAnnotatorClient } from '@google-cloud/vision';

@Injectable()
export class ExpenseService {
  private readonly logger = new Logger(ExpenseService.name);
  private visionClient: ImageAnnotatorClient;

  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {
    // Inicializa Google Vision
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      this.visionClient = new ImageAnnotatorClient();
    }
  }

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const expense = this.expenseRepository.create(createExpenseDto);
    return this.expenseRepository.save(expense);
  }

  async findAll(tripId?: string): Promise<Expense[]> {
    const where = tripId ? { tripId } : {};
    return this.expenseRepository.find({
      where,
      relations: ['trip'],
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Expense | null> {
    return this.expenseRepository.findOne({
      where: { id },
      relations: ['trip'],
    });
  }

  async processReceipt(imageUrl: string, tripId: string): Promise<Expense> {
    try {
      // Processa imagem com Google Vision
      const [result] = await this.visionClient.textDetection(imageUrl);
      const text = result.fullTextAnnotation?.text || '';

      this.logger.log(`OCR processado: ${text.substring(0, 100)}...`);

      // Extrai informações (simplificado)
      const amount = this.extractAmount(text);
      const date = this.extractDate(text);

      // Cria expense
      const expense = await this.create({
        tripId,
        amount,
        currency: 'BRL',
        category: 'OTHER' as any,
        description: 'Despesa via OCR',
        date: date || new Date(),
        receiptUrl: imageUrl,
        ocrText: text,
      });

      return expense;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Erro no OCR: ${errorMessage}`);
      throw new Error('Falha ao processar comprovante');
    }
  }

  private extractAmount(text: string): number {
    // Regex simplificado para extrair valores monetários
    const regex = /R\$?\s*(\d+[.,]\d{2})/i;
    const match = text.match(regex);
    if (match) {
      return parseFloat(match[1].replace(',', '.'));
    }
    return 0;
  }

  private extractDate(text: string): Date | null {
    // Regex simplificado para datas
    const regex = /(\d{2})[\/\-](\d{2})[\/\-](\d{2,4})/;
    const match = text.match(regex);
    if (match) {
      const [, day, month, year] = match;
      return new Date(`${year}-${month}-${day}`);
    }
    return null;
  }
}

