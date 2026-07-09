ALTER TABLE `clients` ADD `phone` text;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_clients` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`nom` text NOT NULL UNIQUE,
	`email` text UNIQUE,
	`phone` text
);
--> statement-breakpoint
INSERT INTO `__new_clients`(`id`, `nom`, `email`) SELECT `id`, `nom`, `email` FROM `clients`;--> statement-breakpoint
DROP TABLE `clients`;--> statement-breakpoint
ALTER TABLE `__new_clients` RENAME TO `clients`;--> statement-breakpoint
PRAGMA foreign_keys=ON;