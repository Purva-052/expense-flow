import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesService {
    private readonly categoryRepository;
    constructor(categoryRepository: Repository<Category>);
    create(createCategoryDto: CreateCategoryDto, companyId: string): Promise<Category>;
    findAll(companyId: string): Promise<Category[]>;
    findOne(id: string, companyId: string): Promise<Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto, companyId: string): Promise<Category>;
    remove(id: string, companyId: string): Promise<void>;
}
