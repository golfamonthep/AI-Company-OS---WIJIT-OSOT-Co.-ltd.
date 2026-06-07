CREATE TABLE `ad_analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`budget` float NOT NULL,
	`impressions` float NOT NULL,
	`clicks` float NOT NULL,
	`conversions` float NOT NULL,
	`revenue` float NOT NULL,
	`productType` varchar(255) NOT NULL,
	`targetAudience` varchar(500),
	`adContent` text,
	`roas` float,
	`cpc` float,
	`ctr` float,
	`conversionRate` float,
	`score` int,
	`complianceIssues` json,
	`recommendations` json,
	`aiAnalysis` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ad_analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ad_copies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productName` varchar(255) NOT NULL,
	`productDescription` text,
	`targetAudience` varchar(500),
	`tone` varchar(100),
	`objective` varchar(100),
	`generatedCopies` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ad_copies_id` PRIMARY KEY(`id`)
);
