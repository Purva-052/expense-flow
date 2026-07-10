import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, companyId: string): Promise<Category> {
    const existing = await this.categoryRepository.findOne({
      where: { name: createCategoryDto.name, companyId }
    });
    
    if (existing) {
      throw new ConflictException(`Category with name '${createCategoryDto.name}' already exists in your company`);
    }
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      companyId,
    });
    return this.categoryRepository.save(category);
  }

  async findAll(companyId: string): Promise<Category[]> {
    return this.categoryRepository.find({ where: { companyId } });
  }

  async findOne(id: string, companyId: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({ where: { id, companyId } });
    if (!category) {
      throw new NotFoundException(`Category #${id} not found`);
    }
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto, companyId: string): Promise<Category> {
    const category = await this.findOne(id, companyId);
    
    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existing = await this.categoryRepository.findOne({
        where: { name: updateCategoryDto.name, companyId }
      });
      
      if (existing) {
        throw new ConflictException(`Category with name '${updateCategoryDto.name}' already exists in your company`);
      }
    }
    this.categoryRepository.merge(category, updateCategoryDto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string, companyId: string): Promise<void> {
    const category = await this.findOne(id, companyId);
    await this.categoryRepository.remove(category);
  }
}
