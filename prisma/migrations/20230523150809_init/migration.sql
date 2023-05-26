-- CreateTable
CREATE TABLE "User" (
    "userID" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userID")
);

-- CreateTable
CREATE TABLE "Birthday" (
    "birthdayID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "date" TEXT NOT NULL,

    CONSTRAINT "Birthday_pkey" PRIMARY KEY ("birthdayID")
);

-- CreateTable
CREATE TABLE "Cookie" (
    "cookieID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "given" INTEGER NOT NULL,
    "received" INTEGER NOT NULL,

    CONSTRAINT "Cookie_pkey" PRIMARY KEY ("cookieID")
);

-- CreateTable
CREATE TABLE "Guild" (
    "guildID" TEXT NOT NULL,

    CONSTRAINT "Guild_pkey" PRIMARY KEY ("guildID")
);

-- CreateTable
CREATE TABLE "GuildConfig" (
    "configID" TEXT NOT NULL,
    "guildID" TEXT NOT NULL,
    "logChannelID" TEXT NOT NULL DEFAULT '',
    "cmdIgnoredChannelIDs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "eventIgnoredChannelIDs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "rankedIgnoredChannelIDs" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "GuildConfig_pkey" PRIMARY KEY ("configID")
);

-- CreateTable
CREATE TABLE "Ban" (
    "banID" TEXT NOT NULL,
    "guildID" TEXT NOT NULL,
    "authorID" TEXT NOT NULL,
    "bannedID" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT NOT NULL,
    "unbanned" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Ban_pkey" PRIMARY KEY ("banID")
);

-- CreateTable
CREATE TABLE "Rank" (
    "rankID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "guildID" TEXT NOT NULL,
    "xp" INTEGER NOT NULL,
    "xpLevel" INTEGER NOT NULL,
    "levelNotifs" BOOLEAN NOT NULL DEFAULT true,
    "credits" INTEGER NOT NULL,

    CONSTRAINT "Rank_pkey" PRIMARY KEY ("rankID")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "ticketID" TEXT NOT NULL,
    "ticketPanelID" TEXT NOT NULL,
    "authorID" TEXT NOT NULL,
    "open" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("ticketID")
);

-- CreateTable
CREATE TABLE "TicketPanel" (
    "ticketPanelID" TEXT NOT NULL,
    "guildID" TEXT NOT NULL,
    "categoryID" TEXT NOT NULL,
    "panelEmbedJSON" JSONB NOT NULL,
    "ticketEmbedJSON" JSONB NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TicketPanel_pkey" PRIMARY KEY ("ticketPanelID")
);

-- CreateTable
CREATE TABLE "Warning" (
    "warningID" TEXT NOT NULL,
    "guildID" TEXT NOT NULL,
    "authorID" TEXT NOT NULL,
    "warnedID" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Warning_pkey" PRIMARY KEY ("warningID")
);

-- CreateTable
CREATE TABLE "Notes" (
    "noteID" TEXT NOT NULL,
    "authorID" TEXT NOT NULL,
    "watchedID" TEXT NOT NULL,
    "guildID" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "noteText" TEXT NOT NULL,

    CONSTRAINT "Notes_pkey" PRIMARY KEY ("noteID")
);

-- CreateTable
CREATE TABLE "MemberStats" (
    "statsID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "guildID" TEXT NOT NULL,
    "messageCount" INTEGER NOT NULL,
    "messageCountByHour" JSONB NOT NULL,

    CONSTRAINT "MemberStats_pkey" PRIMARY KEY ("statsID")
);

-- CreateIndex
CREATE UNIQUE INDEX "Birthday_userID_key" ON "Birthday"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "Cookie_userID_key" ON "Cookie"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "GuildConfig_guildID_key" ON "GuildConfig"("guildID");

-- CreateIndex
CREATE UNIQUE INDEX "TicketPanel_name_key" ON "TicketPanel"("name");

-- AddForeignKey
ALTER TABLE "Birthday" ADD CONSTRAINT "Birthday_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cookie" ADD CONSTRAINT "Cookie_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("userID") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GuildConfig" ADD CONSTRAINT "GuildConfig_guildID_fkey" FOREIGN KEY ("guildID") REFERENCES "Guild"("guildID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ban" ADD CONSTRAINT "Ban_guildID_fkey" FOREIGN KEY ("guildID") REFERENCES "Guild"("guildID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rank" ADD CONSTRAINT "Rank_guildID_fkey" FOREIGN KEY ("guildID") REFERENCES "Guild"("guildID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ticketPanelID_fkey" FOREIGN KEY ("ticketPanelID") REFERENCES "TicketPanel"("ticketPanelID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketPanel" ADD CONSTRAINT "TicketPanel_guildID_fkey" FOREIGN KEY ("guildID") REFERENCES "Guild"("guildID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Warning" ADD CONSTRAINT "Warning_guildID_fkey" FOREIGN KEY ("guildID") REFERENCES "Guild"("guildID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notes" ADD CONSTRAINT "Notes_guildID_fkey" FOREIGN KEY ("guildID") REFERENCES "Guild"("guildID") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberStats" ADD CONSTRAINT "MemberStats_guildID_fkey" FOREIGN KEY ("guildID") REFERENCES "Guild"("guildID") ON DELETE CASCADE ON UPDATE CASCADE;
