import { User } from '../../users/entities/user.entity';
export declare class Company {
    id: string;
    name: string;
    domain: string;
    users: User[];
    createdAt: Date;
    updatedAt: Date;
}
