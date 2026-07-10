import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateExpenseTable1783412614005 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
