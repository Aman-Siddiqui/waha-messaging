import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1758965413910 implements MigrationInterface {
    name = 'InitSchema1758965413910'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "waha_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "external_session_id" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'inactive', "engine" character varying, "last_qr" text, "meta" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_cd3270031b4df00690f811f2359" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_5725a1688bc09d2557d76ee878" ON "waha_sessions" ("external_session_id") `);
        await queryRunner.query(`CREATE TYPE "public"."messages_direction_enum" AS ENUM('in', 'out')`);
        await queryRunner.query(`CREATE TABLE "messages" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "sessionId" uuid NOT NULL, "direction" "public"."messages_direction_enum" NOT NULL, "to_msisdn" character varying, "from_msisdn" character varying, "body" text, "status" character varying NOT NULL DEFAULT 'pending', "external_message_id" character varying, "raw" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_aa2a0fc3c26ec22fb373003d0b" ON "messages" ("external_message_id") `);
        await queryRunner.query(`CREATE TABLE "tenants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_32731f181236a46182a38c992a8" UNIQUE ("name"), CONSTRAINT "PK_53be67a04681c66b87ee27c9321" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('TENANT_ADMIN', 'MANAGER', 'AGENT', 'AUDITOR')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" uuid NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'AGENT', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`ALTER TABLE "waha_sessions" ADD CONSTRAINT "FK_5ea83712325fe6a33d97ba6d3ec" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_809cf06e658568d5579aa335cb5" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "messages" ADD CONSTRAINT "FK_066163c46cda7e8187f96bc87a0" FOREIGN KEY ("sessionId") REFERENCES "waha_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_c58f7e88c286e5e3478960a998b" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_c58f7e88c286e5e3478960a998b"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_066163c46cda7e8187f96bc87a0"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP CONSTRAINT "FK_809cf06e658568d5579aa335cb5"`);
        await queryRunner.query(`ALTER TABLE "waha_sessions" DROP CONSTRAINT "FK_5ea83712325fe6a33d97ba6d3ec"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "tenants"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aa2a0fc3c26ec22fb373003d0b"`);
        await queryRunner.query(`DROP TABLE "messages"`);
        await queryRunner.query(`DROP TYPE "public"."messages_direction_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5725a1688bc09d2557d76ee878"`);
        await queryRunner.query(`DROP TABLE "waha_sessions"`);
    }

}
