"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpensesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const expense_entity_1 = require("./entities/expense.entity");
const expense_status_enum_1 = require("./enums/expense-status.enum");
let ExpensesService = class ExpensesService {
    expenseRepository;
    constructor(expenseRepository) {
        this.expenseRepository = expenseRepository;
    }
    async create(createExpenseDto, userId, companyId) {
        const expense = this.expenseRepository.create({
            ...createExpenseDto,
            userId,
            companyId,
        });
        return this.expenseRepository.save(expense);
    }
    async findAllForCompany(companyId) {
        return this.expenseRepository.find({
            where: { companyId },
            relations: { user: true, category: true },
        });
    }
    async findAllForUser(userId, companyId) {
        return this.expenseRepository.find({
            where: { userId, companyId },
            relations: { category: true },
        });
    }
    async findOne(id, companyId, userId) {
        const whereClause = { id, companyId };
        if (userId) {
            whereClause.userId = userId;
        }
        const expense = await this.expenseRepository.findOne({
            where: whereClause,
            relations: { user: true, category: true },
        });
        if (!expense) {
            throw new common_1.NotFoundException(`Expense #${id} not found`);
        }
        return expense;
    }
    async update(id, updateExpenseDto, companyId, userId) {
        const whereClause = { id, companyId };
        if (userId) {
            whereClause.userId = userId;
        }
        const expense = await this.expenseRepository.findOne({ where: whereClause });
        if (!expense) {
            throw new common_1.NotFoundException(`Expense #${id} not found or you don't have permission to update it`);
        }
        if (expense.status !== expense_status_enum_1.ExpenseStatus.PENDING) {
            throw new common_1.ForbiddenException('Cannot update an expense that has already been approved or rejected');
        }
        this.expenseRepository.merge(expense, updateExpenseDto);
        return this.expenseRepository.save(expense);
    }
    async updateStatus(id, status, companyId) {
        const expense = await this.findOne(id, companyId);
        expense.status = status;
        return this.expenseRepository.save(expense);
    }
    async remove(id, companyId, userId) {
        const expense = await this.expenseRepository.findOne({ where: { id, companyId, userId } });
        if (!expense) {
            throw new common_1.NotFoundException(`Expense #${id} not found or you don't have permission to delete it`);
        }
        if (expense.status !== expense_status_enum_1.ExpenseStatus.PENDING) {
            throw new common_1.ForbiddenException('Cannot delete an expense that has already been approved or rejected');
        }
        await this.expenseRepository.remove(expense);
    }
};
exports.ExpensesService = ExpensesService;
exports.ExpensesService = ExpensesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(expense_entity_1.Expense)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ExpensesService);
//# sourceMappingURL=expenses.service.js.map