-- CreateTable
CREATE TABLE "WorkoutPlan" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WorkoutPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutDay" (
  "id" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "dayNumber" INTEGER NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "totalLabel" TEXT NOT NULL,
  "tip" TEXT,
  "focus" TEXT,
  "finisher" TEXT,
  "options" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WorkoutDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutRound" (
  "id" TEXT NOT NULL,
  "dayId" TEXT NOT NULL,
  "roundNumber" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "targetSeconds" INTEGER NOT NULL,
  "restSeconds" INTEGER NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "WorkoutRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutRoundResult" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "dayId" TEXT NOT NULL,
  "roundId" TEXT NOT NULL,
  "targetSeconds" INTEGER NOT NULL,
  "elapsedMs" INTEGER NOT NULL,
  "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WorkoutRoundResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutPlan_slug_key" ON "WorkoutPlan"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutDay_planId_dayNumber_key" ON "WorkoutDay"("planId", "dayNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutDay_planId_slug_key" ON "WorkoutDay"("planId", "slug");

-- CreateIndex
CREATE INDEX "WorkoutDay_planId_dayNumber_idx" ON "WorkoutDay"("planId", "dayNumber");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutRound_dayId_roundNumber_key" ON "WorkoutRound"("dayId", "roundNumber");

-- CreateIndex
CREATE INDEX "WorkoutRound_dayId_roundNumber_idx" ON "WorkoutRound"("dayId", "roundNumber");

-- CreateIndex
CREATE INDEX "WorkoutRoundResult_planId_dayId_completedAt_idx" ON "WorkoutRoundResult"("planId", "dayId", "completedAt");

-- CreateIndex
CREATE INDEX "WorkoutRoundResult_userId_completedAt_idx" ON "WorkoutRoundResult"("userId", "completedAt");

-- CreateIndex
CREATE INDEX "WorkoutRoundResult_roundId_idx" ON "WorkoutRoundResult"("roundId");

-- AddForeignKey
ALTER TABLE "WorkoutDay" ADD CONSTRAINT "WorkoutDay_planId_fkey" FOREIGN KEY ("planId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutRound" ADD CONSTRAINT "WorkoutRound_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "WorkoutDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutRoundResult" ADD CONSTRAINT "WorkoutRoundResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutRoundResult" ADD CONSTRAINT "WorkoutRoundResult_planId_fkey" FOREIGN KEY ("planId") REFERENCES "WorkoutPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutRoundResult" ADD CONSTRAINT "WorkoutRoundResult_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "WorkoutDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutRoundResult" ADD CONSTRAINT "WorkoutRoundResult_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "WorkoutRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;
