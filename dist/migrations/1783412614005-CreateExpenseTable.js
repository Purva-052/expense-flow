"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateExpenseTable1783412614005 = void 0;
class CreateExpenseTable1783412614005 {
    name = 'CreateExpenseTable1783412614005';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."expenses_status_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'REIMBURSED')`);
        await queryRunner.query(`CREATE TABLE "expenses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" numeric(10,2) NOT NULL, "currency" character varying NOT NULL DEFAULT 'USD', "date" date NOT NULL, "description" character varying NOT NULL, "status" "public"."expenses_status_enum" NOT NULL DEFAULT 'PENDING', "userId" uuid NOT NULL, "companyId" uuid NOT NULL, "categoryId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_94c3ceb17e3140abc9282c20610" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD CONSTRAINT "FK_3d211de716f0f14ea7a8a4b1f2c" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD CONSTRAINT "FK_d94bd2d2e22b7a3192c7389782e" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "expenses" ADD CONSTRAINT "FK_ac0801a1760c5f9ce43c03bacd0" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_ac0801a1760c5f9ce43c03bacd0"`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_d94bd2d2e22b7a3192c7389782e"`);
        await queryRunner.query(`ALTER TABLE "expenses" DROP CONSTRAINT "FK_3d211de716f0f14ea7a8a4b1f2c"`);
        await queryRunner.query(`DROP TABLE "expenses"`);
        await queryRunner.query(`DROP TYPE "public"."expenses_status_enum"`);
    }
}
exports.CreateExpenseTable1783412614005 = CreateExpenseTable1783412614005;
//# sourceMappingURL=1783412614005-CreateExpenseTable.js.map