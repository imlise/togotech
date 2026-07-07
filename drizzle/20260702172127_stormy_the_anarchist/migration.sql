CREATE TABLE `factures` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`reference` text NOT NULL,
	`total_ht` real NOT NULL,
	`tva` integer DEFAULT 18 NOT NULL,
	`total_ttc` real NOT NULL,
	`date_echeance` integer NOT NULL,
	`date_de_paiement` integer NOT NULL,
	`proforma_id` integer,
	CONSTRAINT `fk_factures_proforma_id_proformas_id_fk` FOREIGN KEY (`proforma_id`) REFERENCES `proformas`(`id`)
);
--> statement-breakpoint
CREATE TABLE `produits` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`nom` text NOT NULL,
	`description` text NOT NULL,
	`image` text NOT NULL,
	`prix_unitaire` real NOT NULL,
	`reduction` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `proformas` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`reference` text NOT NULL,
	`total_ht` real NOT NULL,
	`tva` integer DEFAULT 18 NOT NULL,
	`total_ttc` real NOT NULL,
	`validite` integer NOT NULL,
	`date_de_livraison` integer NOT NULL,
	`conditions_de_paiement` integer NOT NULL,
	`garantie` text NOT NULL,
	`client` text NOT NULL,
	`converted_to_invoice_id` integer
);
--> statement-breakpoint
CREATE TABLE `users_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL,
	`age` integer NOT NULL,
	`email` text NOT NULL UNIQUE
);
--> statement-breakpoint
CREATE TABLE `utilisateur` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`nom_utilisateur` text NOT NULL,
	`mot_de_passe` text NOT NULL,
	`role` text NOT NULL
);
