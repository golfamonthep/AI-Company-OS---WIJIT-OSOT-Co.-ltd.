CREATE TABLE `ad_insights_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`adAccountId` varchar(64) NOT NULL,
	`dateRange` varchar(10) NOT NULL,
	`data` json NOT NULL,
	`fetchedAt` bigint NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ad_insights_cache_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `facebook_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`accessToken` text NOT NULL,
	`selectedAdAccountId` varchar(64),
	`selectedAdAccountName` varchar(255),
	`expiresAt` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `facebook_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `facebook_tokens_userId_unique` UNIQUE(`userId`)
);
