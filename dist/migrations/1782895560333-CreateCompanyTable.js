"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCompanyTable1782895560333 = void 0;
class CreateCompanyTable1782895560333 {
    name = 'CreateCompanyTable1782895560333';
    async up(queryRunner) {
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
        await queryRunner.query(`CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "domain" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3dacbb3eb4f095e29372ff8e131" UNIQUE ("name"), CONSTRAINT "UQ_89a223b4d883067d909eedd3558" UNIQUE ("domain"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE "companies"`);
    }
}
exports.CreateCompanyTable1782895560333 = CreateCompanyTable1782895560333;
//# sourceMappingURL=1782895560333-CreateCompanyTable.js.map