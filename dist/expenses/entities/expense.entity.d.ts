import { User } from '../../users/entities/user.entity';
import { Company } from '../../companies/entities/company.entity';
import { Category } from '../../categories/entities/category.entity';
import { ExpenseStatus } from '../enums/expense-status.enum';
export declare class Expense {
    id: string;
    amount: number;
    currency: string;
    date: Date;
    description: string;
    status: ExpenseStatus;
    user: User;
    userId: string;
    company: Company;
    companyId: string;
    category: Category;
    categoryId: string;
    createdAt: Date;
    updatedAt: Date;
}
