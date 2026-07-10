import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseStatus } from './enums/expense-status.enum';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, userId: string, companyId: string): Promise<Expense> {
    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      userId,
      companyId,
    });
    return this.expenseRepository.save(expense);
  }

  async findAllForCompany(companyId: string): Promise<Expense[]> {
    return this.expenseRepository.find({
      where: { companyId },
      relations: { user: true, category: true },
    });
  }

  async findAllForUser(userId: string, companyId: string): Promise<Expense[]> {
    return this.expenseRepository.find({
      where: { userId, companyId },
      relations: { category: true },
    });
  }

  async findOne(id: string, companyId: string, userId?: string): Promise<Expense> {
    const whereClause: any = { id, companyId };
    if (userId) {
      whereClause.userId = userId;
    }
    const expense = await this.expenseRepository.findOne({
      where: whereClause,
      relations: { user: true, category: true },
    });
    if (!expense) {
      throw new NotFoundException(`Expense #${id} not found`);
    }
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto, companyId: string, userId?: string): Promise<Expense> {
    // If userId is provided, ensure the user owns the expense (for regular employees updating their own pending expenses)
    const whereClause: any = { id, companyId };
    if (userId) {
      whereClause.userId = userId;
    }
    
    const expense = await this.expenseRepository.findOne({ where: whereClause });
    if (!expense) {
      throw new NotFoundException(`Expense #${id} not found or you don't have permission to update it`);
    }
    if (expense.status !== ExpenseStatus.PENDING) {
      throw new ForbiddenException('Cannot update an expense that has already been approved or rejected');
    }

    this.expenseRepository.merge(expense, updateExpenseDto);
    return this.expenseRepository.save(expense);
  }

  async updateStatus(id: string, status: ExpenseStatus, companyId: string): Promise<Expense> {
    const expense = await this.findOne(id, companyId);
    expense.status = status;
    return this.expenseRepository.save(expense);
  }

  async remove(id: string, companyId: string, userId: string): Promise<void> {
    const expense = await this.expenseRepository.findOne({ where: { id, companyId, userId } });
    if (!expense) {
      throw new NotFoundException(`Expense #${id} not found or you don't have permission to delete it`);
    }
    if (expense.status !== ExpenseStatus.PENDING) {
      throw new ForbiddenException('Cannot delete an expense that has already been approved or rejected');
    }
    await this.expenseRepository.remove(expense);
  }
}
