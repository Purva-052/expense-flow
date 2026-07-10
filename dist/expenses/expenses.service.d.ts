import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseStatus } from './enums/expense-status.enum';
export declare class ExpensesService {
    private readonly expenseRepository;
    constructor(expenseRepository: Repository<Expense>);
    create(createExpenseDto: CreateExpenseDto, userId: string, companyId: string): Promise<Expense>;
    findAllForCompany(companyId: string): Promise<Expense[]>;
    findAllForUser(userId: string, companyId: string): Promise<Expense[]>;
    findOne(id: string, companyId: string, userId?: string): Promise<Expense>;
    update(id: string, updateExpenseDto: UpdateExpenseDto, companyId: string, userId?: string): Promise<Expense>;
    updateStatus(id: string, status: ExpenseStatus, companyId: string): Promise<Expense>;
    remove(id: string, companyId: string, userId: string): Promise<void>;
}
