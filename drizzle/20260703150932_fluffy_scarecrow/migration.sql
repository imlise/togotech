CREATE TABLE `clients` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`nom` text NOT NULL UNIQUE,
	`email` text NOT NULL UNIQUE
);
--> statement-breakpoint
ALTER TABLE `factures` ADD `is_proforma` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `factures` ADD `client_id` integer REFERENCES clients(id);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_factures` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`reference` text NOT NULL,
	`total_ht` real NOT NULL,
	`tva` integer DEFAULT 18 NOT NULL,
	`total_ttc` real NOT NULL,
	`date_echeance` integer,
	`date_de_paiement` integer,
	`is_proforma` integer NOT NULL,
	`validite` integer NOT NULL,
	`date_de_livraison` integer,
	`garantie` text NOT NULL,
	`client_id` integer,
	CONSTRAINT `fk_factures_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_factures`(`id`, `reference`, `total_ht`, `tva`, `total_ttc`, `date_echeance`, `date_de_paiement`, `validite`, `date_de_livraison`, `garantie`) SELECT `id`, `reference`, `total_ht`, `tva`, `total_ttc`, `date_echeance`, `date_de_paiement`, `validite`, `date_de_livraison`, `garantie` FROM `factures`;--> statement-breakpoint
DROP TABLE `factures`;--> statement-breakpoint
ALTER TABLE `__new_factures` RENAME TO `factures`;--> statement-breakpoint
PRAGMA foreign_keys=ON;