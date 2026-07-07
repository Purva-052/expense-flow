import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(name: string, domain?: string): Promise<Company> {
    const existingCompany = await this.companyRepository.findOne({ where: { name } });
    if (existingCompany) {
      throw new ConflictException('Company with this name already exists');
    }

    const company = this.companyRepository.create({ name, domain });
    return this.companyRepository.save(company);
  }

  async findById(id: string): Promise<Company | null> {
    return this.companyRepository.findOne({ where: { id } });
  }
}
