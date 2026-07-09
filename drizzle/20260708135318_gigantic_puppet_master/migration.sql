PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_produits` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`nom` text NOT NULL,
	`description` text NOT NULL,
	`image` text,
	`prix_unitaire` real NOT NULL,
	`reduction` integer NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_produits`(`id`, `nom`, `description`, `image`, `prix_unitaire`, `reduction`) SELECT `id`, `nom`, `description`, `image`, `prix_unitaire`, `reduction` FROM `produits`;--> statement-breakpoint
DROP TABLE `produits`;--> statement-breakpoint
ALTER TABLE `__new_produits` RENAME TO `produits`;--> statement-breakpoint
PRAGMA foreign_keys=ON;