import { MigrationInterface, QueryRunner } from "typeorm";

// Skema awal Dinas Academy (dibuat dari seluruh entity TypeORM).
export class InitialSchema1795672989456 implements MigrationInterface {
    name = 'InitialSchema1795672989456'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Baseline: database yang sudah berisi skema (mis. hasil restore dump lokal yang dulu dibuat
        // dengan synchronize) cukup ditandai sudah termigrasi — jangan buat ulang tabel.
        const existing = await queryRunner.query(`SELECT to_regclass('public."user"') AS t`);
        if (existing?.[0]?.t) {
            console.log('[migration] Skema sudah ada — InitialSchema ditandai sebagai baseline.');
            return;
        }
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'student', "photoUrl" character varying, "phone" character varying, "school" character varying, "targetType" character varying, "targetUniversity" character varying, "targetMajor" character varying, "goals" text, "profileCompleted" boolean NOT NULL DEFAULT false, "hasPurchasedPackage" boolean NOT NULL DEFAULT false, "packageType" character varying, "isEmailVerified" boolean NOT NULL DEFAULT false, "emailVerifyToken" character varying, "joinDate" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "major" ("id" integer NOT NULL, "universityId" integer NOT NULL, "name" character varying NOT NULL, "jenjang" character varying(4) NOT NULL DEFAULT 'S1', "peminatan" character varying(10), "dayaTampung" integer, "peminat" integer, "peminatTahun" integer, "portofolio" character varying, "passingGrade" integer, "passingGradeSource" character varying(10), "isActive" boolean NOT NULL DEFAULT true, "source" character varying(10) NOT NULL DEFAULT 'manual', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_00341ff87e17ae50751c5da05ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8579b10921e2472a4cdf5d2be2" ON "major" ("universityId") `);
        await queryRunner.query(`CREATE TABLE "university" ("id" integer NOT NULL, "name" character varying NOT NULL, "shortName" character varying, "province" character varying, "city" character varying, "kategori" character varying(10) NOT NULL DEFAULT 'Akademik', "isPtnBh" boolean NOT NULL DEFAULT false, "website" character varying, "isActive" boolean NOT NULL DEFAULT true, "source" character varying(10) NOT NULL DEFAULT 'manual', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d14e5687dbd51fd7a915c22ac13" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tryout" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "category" character varying NOT NULL, "difficulty" character varying NOT NULL, "duration" integer NOT NULL, "totalQuestions" integer NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "isLocked" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_13bf036c7170e95efb18d0ea023" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question" ("id" SERIAL NOT NULL, "tryoutId" integer NOT NULL, "subtestCode" character varying NOT NULL, "subtestName" character varying NOT NULL, "questionText" text NOT NULL, "optionA" text NOT NULL, "optionB" text NOT NULL, "optionC" text NOT NULL, "optionD" text NOT NULL, "optionE" text NOT NULL DEFAULT '', "correctAnswer" character varying NOT NULL, "explanation" text, "tips" text, "optionWeights" jsonb, "orderIndex" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_21e5786aa0ea704ae185a79b2d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "package" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "description" text NOT NULL, "price" numeric NOT NULL, "duration" integer NOT NULL, "track" character varying NOT NULL, "type" character varying NOT NULL, "features" text NOT NULL, "includedTryouts" text NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_308364c66df656295bc4ec467c2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "exam_result" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "tryoutId" integer NOT NULL, "tryoutTitle" character varying, "category" character varying NOT NULL, "answers" json NOT NULL, "correct" integer NOT NULL, "wrong" integer NOT NULL, "unanswered" integer NOT NULL, "totalQuestions" integer NOT NULL, "totalScore" numeric NOT NULL, "maxScore" numeric NOT NULL, "percentage" numeric NOT NULL, "rank" integer NOT NULL DEFAULT '0', "totalParticipants" integer NOT NULL DEFAULT '1', "subScores" json, "completedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9c05af0457cef1ec4ee5f074df7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "packageName" character varying NOT NULL, "packageType" character varying NOT NULL, "amount" numeric NOT NULL, "uniqueCode" integer NOT NULL, "totalAmount" numeric NOT NULL, "paymentMethod" character varying NOT NULL, "status" character varying NOT NULL, "activatedAt" TIMESTAMP, "activatedBy" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "exam_draft" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "tryoutId" integer NOT NULL, "answers" json NOT NULL, "currentSubtest" character varying NOT NULL, "savedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8a564a965e83e3d147f56f26795" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "major" ADD CONSTRAINT "FK_8579b10921e2472a4cdf5d2be2a" FOREIGN KEY ("universityId") REFERENCES "university"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question" ADD CONSTRAINT "FK_80e3cdbb82b5d6847ccb50a3e66" FOREIGN KEY ("tryoutId") REFERENCES "tryout"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_caabe91507b3379c7ba73637b84"`);
        await queryRunner.query(`ALTER TABLE "question" DROP CONSTRAINT "FK_80e3cdbb82b5d6847ccb50a3e66"`);
        await queryRunner.query(`ALTER TABLE "major" DROP CONSTRAINT "FK_8579b10921e2472a4cdf5d2be2a"`);
        await queryRunner.query(`DROP TABLE "exam_draft"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TABLE "exam_result"`);
        await queryRunner.query(`DROP TABLE "package"`);
        await queryRunner.query(`DROP TABLE "question"`);
        await queryRunner.query(`DROP TABLE "tryout"`);
        await queryRunner.query(`DROP TABLE "university"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8579b10921e2472a4cdf5d2be2"`);
        await queryRunner.query(`DROP TABLE "major"`);
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
