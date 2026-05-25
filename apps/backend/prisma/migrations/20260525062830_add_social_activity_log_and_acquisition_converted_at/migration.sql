-- AlterTable
ALTER TABLE "UserAcquisition" ADD COLUMN "convertedAt" DATETIME;

-- CreateTable
CREATE TABLE "SocialActivityLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "platform" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "campaign" TEXT,
    "source" TEXT,
    "metadata" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SocialActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SocialActivityLog_platform_createdAt_idx" ON "SocialActivityLog"("platform", "createdAt");

-- CreateIndex
CREATE INDEX "SocialActivityLog_type_createdAt_idx" ON "SocialActivityLog"("type", "createdAt");

-- CreateIndex
CREATE INDEX "SocialActivityLog_userId_idx" ON "SocialActivityLog"("userId");
