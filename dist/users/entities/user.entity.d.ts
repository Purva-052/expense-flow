import { Company } from '../../companies/entities/company.entity';
import { Role } from '../enums/role.enum';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: Role;
    company: Company;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
}
