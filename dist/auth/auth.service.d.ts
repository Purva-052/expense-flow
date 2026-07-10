import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Role } from '../users/enums/role.enum';
export declare class AuthService {
    private readonly usersService;
    private readonly companiesService;
    private readonly jwtService;
    constructor(usersService: UsersService, companiesService: CompaniesService, jwtService: JwtService);
    register(registerDto: RegisterDto): Promise<{
        access_token: string;
    }>;
    validateUser(loginDto: LoginDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: Role;
        company: import("../companies/entities/company.entity").Company;
        companyId: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    login(user: any): Promise<{
        access_token: string;
    }>;
}
