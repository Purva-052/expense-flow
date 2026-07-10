import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ExpenseStatus } from './enums/expense-status.enum';
export declare class ExpensesController {
    private readonly expensesService;
    constructor(expensesService: ExpensesService);
    create(createExpenseDto: CreateExpenseDto, user: any): Promise<import("./entities/expense.entity").Expense>;
    findAll(user: any): Promise<import("./entities/expense.entity").Expense[]>;
    findOne(id: string, user: any): Promise<import("./entities/expense.entity").Expense>;
    update(id: string, updateExpenseDto: UpdateExpenseDto, user: any): Promise<import("./entities/expense.entity").Expense>;
    updateStatus(id: string, status: ExpenseStatus, user: any): Promise<import("./entities/expense.entity").Expense>;
    remove(id: string, user: any): Promise<void>;
}
