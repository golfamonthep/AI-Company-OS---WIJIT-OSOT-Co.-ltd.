CREATE TABLE `alert_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alertId` int NOT NULL,
	`userId` int NOT NULL,
	`campaignId` varchar(64) NOT NULL,
	`campaignName` varchar(255) NOT NULL,
	`metricType` varchar(64) NOT NULL,
	`currentValue` float NOT NULL,
	`thresholdValue` float NOT NULL,
	`message` text NOT NULL,
	`lineNotified` tinyint NOT NULL DEFAULT 0,
	`emailNotified` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alert_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budget_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`campaignId` varchar(64) NOT NULL,
	`campaignName` varchar(255) NOT NULL,
	`adAccountId` varchar(64) NOT NULL,
	`metricType` enum('budget_spent','cpm','cost_per_purchase','cpc','cpa','roas_below') NOT NULL,
	`condition` enum('above','below') NOT NULL,
	`thresholdValue` float NOT NULL,
	`notifyLine` tinyint NOT NULL DEFAULT 0,
	`notifyEmail` tinyint NOT NULL DEFAULT 0,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`lastTriggeredAt` bigint,
	`scheduleCronTaskUid` varchar(65),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`lineToken` text,
	`notifyEmail` varchar(320),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_settings_userId_unique` UNIQUE(`userId`)
);
