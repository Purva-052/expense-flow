import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateUserTable1783322951543 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
