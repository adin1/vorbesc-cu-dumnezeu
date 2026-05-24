-- CreateTable
CREATE TABLE "UserAcquisition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "source" TEXT NOT NULL,
    "medium" TEXT,
    "campaign" TEXT,
    "landingPage" TEXT,
    "referrer" TEXT,
    "firstVisitAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserAcquisition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Prayer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bibleVerse" TEXT,
    "bibleReference" TEXT,
    "shortReflection" TEXT,
    "content" TEXT NOT NULL,
    "isGenerated" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Prayer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Prayer_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "PrayerCategory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Prayer" ("categoryId", "content", "createdAt", "id", "isGenerated", "title", "userId") SELECT "categoryId", "content", "createdAt", "id", "isGenerated", "title", "userId" FROM "Prayer";
DROP TABLE "Prayer";
ALTER TABLE "new_Prayer" RENAME TO "Prayer";
CREATE TABLE "new_PrayerRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "anonymous" BOOLEAN NOT NULL DEFAULT true,
    "shareTarget" TEXT NOT NULL DEFAULT 'APP_ONLY',
    "facebookShareText" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "moderationNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrayerRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PrayerRequest" ("anonymous", "content", "createdAt", "id", "moderationNote", "status", "userId") SELECT "anonymous", "content", "createdAt", "id", "moderationNote", "status", "userId" FROM "PrayerRequest";
DROP TABLE "PrayerRequest";
ALTER TABLE "new_PrayerRequest" RENAME TO "PrayerRequest";
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "denomination" TEXT NOT NULL DEFAULT 'GENERAL',
    "dailyStreak" INTEGER NOT NULL DEFAULT 0,
    "notifyDaily" BOOLEAN NOT NULL DEFAULT true,
    "notifyCommunity" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "dailyStreak", "denomination", "email", "id", "name", "notifyCommunity", "notifyDaily", "passwordHash", "updatedAt") SELECT "createdAt", "dailyStreak", "denomination", "email", "id", "name", "notifyCommunity", "notifyDaily", "passwordHash", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "UserAcquisition_source_createdAt_idx" ON "UserAcquisition"("source", "createdAt");

-- CreateIndex
CREATE INDEX "UserAcquisition_userId_idx" ON "UserAcquisition"("userId");
