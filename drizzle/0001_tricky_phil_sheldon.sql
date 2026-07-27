PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_factures` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reference` text NOT NULL,
	`objet` text,
	`suivi_par` text,
	`contact` text,
	`total_ht` real NOT NULL,
	`tva` integer DEFAULT 18 NOT NULL,
	`total_ttc` real NOT NULL,
	`devise` text,
	`date_de_paiement` integer,
	`is_proforma` integer NOT NULL,
	`created_at` text DEFAULT (current_timestamp) NOT NULL,
	`remise_globale` integer,
	`condition` text,
	`status` text DEFAULT 'paid',
	`updated_at` integer,
	`deleted_at` integer,
	`client_id` integer,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_factures`("id", "reference", "objet", "suivi_par", "contact", "total_ht", "tva", "total_ttc", "devise", "date_de_paiement", "is_proforma", "created_at", "remise_globale", "condition", "status", "updated_at", "deleted_at", "client_id") SELECT "id", "reference", "objet", "suivi_par", "contact", "total_ht", "tva", "total_ttc", "devise", "date_de_paiement", "is_proforma", "created_at", "remise_globale", "condition", "status", "updated_at", "deleted_at", "client_id" FROM `factures`;--> statement-breakpoint
DROP TABLE `factures`;--> statement-breakpoint
ALTER TABLE `__new_factures` RENAME TO `factures`;--> statement-breakpoint
PRAGMA foreign_keys=ON;