import { MigrationInterface, QueryRunner } from "typeorm";
export declare class CreateCategoryTable1783412444273 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
