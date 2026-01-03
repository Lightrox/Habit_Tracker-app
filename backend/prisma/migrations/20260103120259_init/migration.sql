-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "dsaDone" BOOLEAN NOT NULL DEFAULT false,
    "dsaType" VARCHAR(20),
    "dsaCount" INTEGER NOT NULL DEFAULT 0,
    "dsaTime" INTEGER NOT NULL DEFAULT 0,
    "meditationDone" BOOLEAN NOT NULL DEFAULT false,
    "meditationTime" INTEGER NOT NULL DEFAULT 0,
    "gymDone" BOOLEAN NOT NULL DEFAULT false,
    "gymType" VARCHAR(20),
    "gymTime" INTEGER NOT NULL DEFAULT 0,
    "learningNotes" TEXT NOT NULL DEFAULT '',
    "learningTime" INTEGER NOT NULL DEFAULT 0,
    "projectDone" BOOLEAN NOT NULL DEFAULT false,
    "projectName" TEXT NOT NULL DEFAULT '',
    "projectNotes" TEXT NOT NULL DEFAULT '',
    "projectTime" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "daily_logs_userId_date_key" ON "daily_logs"("userId", "date");

-- AddForeignKey
ALTER TABLE "daily_logs" ADD CONSTRAINT "daily_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
