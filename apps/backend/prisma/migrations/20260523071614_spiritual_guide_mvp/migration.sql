-- CreateTable
CREATE TABLE "SpiritualMood" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MoodGuide" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "moodId" TEXT NOT NULL,
    "warmMessage" TEXT NOT NULL,
    "verse" TEXT NOT NULL,
    "shortPrayer" TEXT NOT NULL,
    "reflectionQuestion" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "MoodGuide_moodId_fkey" FOREIGN KEY ("moodId") REFERENCES "SpiritualMood" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Verse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reference" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "EncouragementMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topic" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "SpiritualMood_slug_key" ON "SpiritualMood"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SpiritualMood_name_key" ON "SpiritualMood"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MoodGuide_moodId_key" ON "MoodGuide"("moodId");
