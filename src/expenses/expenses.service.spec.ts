import { Test, TestingModule } from '@nestjs/testing';
import { ExpensesService } from './expenses.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { Repository } from 'typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ExpenseStatus } from './enums/expense-status.enum';

describe('ExpensesService', () => {
  let service: ExpensesService;
  let repository: Repository<Expense>;

  const mockExpenseRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpensesService,
        {
          provide: getRepositoryToken(Expense),
          useValue: mockExpenseRepository,
        },
      ],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
    repository = module.get<Repository<Expense>>(getRepositoryToken(Expense));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should return an expense for the given id and companyId', async () => {
      const expense = { id: '1', companyId: 'comp-1' };
      mockExpenseRepository.findOne.mockResolvedValue(expense);

      const result = await service.findOne('1', 'comp-1');
      expect(result).toEqual(expense);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1', companyId: 'comp-1' },
        relations: { user: true, category: true },
      });
    });

    it('should throw NotFoundException if expense is from another company', async () => {
      mockExpenseRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1', 'comp-2')).rejects.toThrow(NotFoundException);
    });

    it('should filter by userId if provided (object-level access control)', async () => {
      const expense = { id: '1', companyId: 'comp-1', userId: 'user-1' };
      mockExpenseRepository.findOne.mockResolvedValue(expense);

      await service.findOne('1', 'comp-1', 'user-1');
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1', companyId: 'comp-1', userId: 'user-1' },
        relations: { user: true, category: true },
      });
    });
  });

  describe('update', () => {
    it('should update a pending expense', async () => {
      const expense = { id: '1', companyId: 'comp-1', userId: 'user-1', status: ExpenseStatus.PENDING };
      mockExpenseRepository.findOne.mockResolvedValue(expense);
      mockExpenseRepository.save.mockResolvedValue({ ...expense, amount: 200 });

      const result = await service.update('1', { amount: 200 }, 'comp-1', 'user-1');
      expect(result.amount).toBe(200);
      expect(repository.merge).toHaveBeenCalledWith(expense, { amount: 200 });
    });

    it('should throw ForbiddenException when updating an approved expense', async () => {
      const expense = { id: '1', companyId: 'comp-1', userId: 'user-1', status: ExpenseStatus.APPROVED };
      mockExpenseRepository.findOne.mockResolvedValue(expense);

      await expect(service.update('1', { amount: 200 }, 'comp-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should delete a pending expense', async () => {
      const expense = { id: '1', companyId: 'comp-1', userId: 'user-1', status: ExpenseStatus.PENDING };
      mockExpenseRepository.findOne.mockResolvedValue(expense);
      
      await service.remove('1', 'comp-1', 'user-1');
      expect(repository.remove).toHaveBeenCalledWith(expense);
    });

    it('should throw ForbiddenException when deleting a rejected expense', async () => {
      const expense = { id: '1', companyId: 'comp-1', userId: 'user-1', status: ExpenseStatus.REJECTED };
      mockExpenseRepository.findOne.mockResolvedValue(expense);

      await expect(service.remove('1', 'comp-1', 'user-1')).rejects.toThrow(ForbiddenException);
    });
  });
});
