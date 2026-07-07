CREATE TABLE `ligne_produit` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`facture_id` integer,
	`produit_id` integer,
	`nombre` integer NOT NULL,
	CONSTRAINT `fk_ligne_produit_facture_id_factures_id_fk` FOREIGN KEY (`facture_id`) REFERENCES `factures`(`id`),
	CONSTRAINT `fk_ligne_produit_produit_id_produits_id_fk` FOREIGN KEY (`produit_id`) REFERENCES `produits`(`id`)
);
--> statement-breakpoint
ALTER TABLE `factures` ADD `isproforma` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `factures` ADD `validite` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `factures` ADD `date_de_livraison` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `factures` ADD `conditions_de_paiement` integer NOT NULL;--> statement-breakpoint
ALTER TABLE `factures` ADD `garantie` text NOT NULL;--> statement-breakpoint
ALTER TABLE `factures` ADD `client` text NOT NULL;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_factures` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`reference` text NOT NULL,
	`total_ht` real NOT NULL,
	`tva` integer DEFAULT 18 NOT NULL,
	`total_ttc` real NOT NULL,
	`date_echeance` integer NOT NULL,
	`date_de_paiement` integer NOT NULL,
	`isproforma` integer NOT NULL,
	`validite` integer NOT NULL,
	`date_de_livraison` integer NOT NULL,
	`conditions_de_paiement` integer NOT NULL,
	`garantie` text NOT NULL,
	`client` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_factures`(`id`, `reference`, `total_ht`, `tva`, `total_ttc`, `date_echeance`, `date_de_paiement`) SELECT `id`, `reference`, `total_ht`, `tva`, `total_ttc`, `date_echeance`, `date_de_paiement` FROM `factures`;--> statement-breakpoint
DROP TABLE `factures`;--> statement-breakpoint
ALTER TABLE `__new_factures` RENAME TO `factures`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP TABLE `proformas`;