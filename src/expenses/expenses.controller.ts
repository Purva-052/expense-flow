import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../users/enums/role.enum';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ExpenseStatus } from './enums/expense-status.enum';

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  create(@Body() createExpenseDto: CreateExpenseDto, @CurrentUser() user: any) {
    return this.expensesService.create(createExpenseDto, user.id, user.companyId);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    // If COMPANY_ADMIN or MANAGER, they see all company expenses. Otherwise just their own.
    // For now, we'll return all company expenses for admins, and just user's expenses for employees.
    if (user.role === 'COMPANY_ADMIN' || user.role === 'MANAGER' || user.role === 'FINANCE') {
      return this.expensesService.findAllForCompany(user.companyId);
    }
    return this.expensesService.findAllForUser(user.id, user.companyId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const isEmployee = user.role !== 'COMPANY_ADMIN' && user.role !== 'MANAGER' && user.role !== 'FINANCE';
    return this.expensesService.findOne(id, user.companyId, isEmployee ? user.id : undefined);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateExpenseDto: UpdateExpenseDto, @CurrentUser() user: any) {
    return this.expensesService.update(id, updateExpenseDto, user.companyId, user.id);
  }

  @Patch(':id/status')
  @Roles(Role.COMPANY_ADMIN, Role.MANAGER)
  updateStatus(
    @Param('id') id: string, 
    @Body('status') status: ExpenseStatus, 
    @CurrentUser() user: any
  ) {
    return this.expensesService.updateStatus(id, status, user.companyId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.expensesService.remove(id, user.companyId, user.id);
  }
}
