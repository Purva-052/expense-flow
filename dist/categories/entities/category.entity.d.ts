import { Company } from '../../companies/entities/company.entity';
export declare class Category {
    id: string;
    name: string;
    company: Company;
    companyId: string;
    createdAt: Date;
    updatedAt: Date;
}
