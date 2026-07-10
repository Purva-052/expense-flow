import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categoriesService;
    constructor(categoriesService: CategoriesService);
    create(createCategoryDto: CreateCategoryDto, user: any): Promise<import("./entities/category.entity").Category>;
    findAll(user: any): Promise<import("./entities/category.entity").Category[]>;
    findOne(id: string, user: any): Promise<import("./entities/category.entity").Category>;
    update(id: string, updateCategoryDto: UpdateCategoryDto, user: any): Promise<import("./entities/category.entity").Category>;
    remove(id: string, user: any): Promise<void>;
}
