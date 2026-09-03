CREATE TABLE `gratitude_entries` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`text` text NOT NULL,
	`createdAt` timestamp NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gratitude_entries_id` PRIMARY KEY(`id`)
);
