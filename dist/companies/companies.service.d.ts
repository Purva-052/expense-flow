import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
export declare class CompaniesService {
    private readonly companyRepository;
    constructor(companyRepository: Repository<Company>);
    create(name: string, domain?: string): Promise<Company>;
    findById(id: string): Promise<Company | null>;
}
