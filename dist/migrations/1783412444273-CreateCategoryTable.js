"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateCategoryTable1783412444273 = void 0;
class CreateCategoryTable1783412444273 {
    name = 'CreateCategoryTable1783412444273';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "companyId" uuid NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_92d9e96e1be5a0b3e94fddb892a" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_92d9e96e1be5a0b3e94fddb892a"`);
        await queryRunner.query(`DROP TABLE "categories"`);
    }
}
exports.CreateCategoryTable1783412444273 = CreateCategoryTable1783412444273;
//# sourceMappingURL=1783412444273-CreateCategoryTable.js.map