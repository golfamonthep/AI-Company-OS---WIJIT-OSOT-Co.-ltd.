CREATE TABLE `report_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduleId` int NOT NULL,
	`userId` int NOT NULL,
	`adAccountId` varchar(64) NOT NULL,
	`reportFormat` varchar(10) NOT NULL,
	`pdfStorageKey` varchar(512),
	`excelStorageKey` varchar(512),
	`lineNotified` tinyint NOT NULL DEFAULT 0,
	`emailNotified` tinyint NOT NULL DEFAULT 0,
	`totalSpend` float,
	`totalImpressions` bigint,
	`totalClicks` bigint,
	`totalLeads` bigint,
	`totalPurchases` bigint,
	`avgRoas` float,
	`status` enum('success','failed','partial') NOT NULL DEFAULT 'success',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `report_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `report_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`adAccountId` varchar(64) NOT NULL,
	`adAccountName` varchar(255),
	`reportFormat` enum('pdf','excel','both') NOT NULL DEFAULT 'both',
	`notifyLine` tinyint NOT NULL DEFAULT 1,
	`notifyEmail` tinyint NOT NULL DEFAULT 0,
	`cronExpression` varchar(64) NOT NULL DEFAULT '0 0 1 * * *',
	`isActive` tinyint NOT NULL DEFAULT 1,
	`scheduleCronTaskUid` varchar(65),
	`lastRunAt` bigint,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `report_schedules_id` PRIMARY KEY(`id`)
);
