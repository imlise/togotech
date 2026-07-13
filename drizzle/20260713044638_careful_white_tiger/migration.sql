ALTER TABLE `factures` ADD `remise_globale` integer;--> statement-breakpoint
ALTER TABLE `factures` ADD `delai_de_livraison` text;--> statement-breakpoint
ALTER TABLE `factures` ADD `condition_de _paiement` text;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_factures` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`reference` text NOT NULL,
	`objet` text,
	`total_ht` real NOT NULL,
	`tva` integer DEFAULT 18 NOT NULL,
	`total_ttc` real NOT NULL,
	`date_de_paiement` integer,
	`is_proforma` integer NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`remise_globale` integer,
	`delai_de_livraison` text,
	`validite` text,
	`garantie` text,
	`condition_de _paiement` text,
	`client_id` integer,
	CONSTRAINT `fk_factures_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_factures`(`id`, `reference`, `objet`, `total_ht`, `tva`, `total_ttc`, `date_de_paiement`, `is_proforma`, `validite`, `created_at`, `garantie`, `client_id`) SELECT `id`, `reference`, `objet`, `total_ht`, `tva`, `total_ttc`, `date_de_paiement`, `is_proforma`, `validite`, `created_at`, `garantie`, `client_id` FROM `factures`;--> statement-breakpoint
DROP TABLE `factures`;--> statement-breakpoint
ALTER TABLE `__new_factures` RENAME TO `factures`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ligne_produit` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`facture_id` integer,
	`produit_id` integer,
	`nom` text NOT NULL,
	`description` text NOT NULL,
	`image` text,
	`prix_unitaire` real NOT NULL,
	`quantite` integer NOT NULL,
	CONSTRAINT `fk_ligne_produit_facture_id_factures_id_fk` FOREIGN KEY (`facture_id`) REFERENCES `factures`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_ligne_produit_produit_id_produits_id_fk` FOREIGN KEY (`produit_id`) REFERENCES `produits`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_ligne_produit`(`id`, `facture_id`, `produit_id`, `nom`, `description`, `image`, `prix_unitaire`, `quantite`) SELECT `id`, `facture_id`, `produit_id`, `nom`, `description`, `image`, `prix_unitaire`, `quantite` FROM `ligne_produit`;--> statement-breakpoint
DROP TABLE `ligne_produit`;--> statement-breakpoint
ALTER TABLE `__new_ligne_produit` RENAME TO `ligne_produit`;--> statement-breakpoint
PRAGMA foreign_keys=ON;