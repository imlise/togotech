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
	`condition_de _paiement` text DEFAULT '60% à l''accord et 40% à la livraison',
	`client_id` integer,
	CONSTRAINT `fk_factures_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_factures`(`id`, `reference`, `objet`, `total_ht`, `tva`, `total_ttc`, `date_de_paiement`, `is_proforma`, `created_at`, `remise_globale`, `delai_de_livraison`, `validite`, `garantie`, `condition_de _paiement`, `client_id`) SELECT `id`, `reference`, `objet`, `total_ht`, `tva`, `total_ttc`, `date_de_paiement`, `is_proforma`, `created_at`, `remise_globale`, `delai_de_livraison`, `validite`, `garantie`, `condition_de _paiement`, `client_id` FROM `factures`;--> statement-breakpoint
DROP TABLE `factures`;--> statement-breakpoint
ALTER TABLE `__new_factures` RENAME TO `factures`;--> statement-breakpoint
PRAGMA foreign_keys=ON;