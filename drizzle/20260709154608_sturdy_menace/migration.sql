CREATE TABLE `clients` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`nom` text NOT NULL UNIQUE,
	`email` text UNIQUE,
	`phone` text
);
--> statement-breakpoint
CREATE TABLE `factures` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`reference` text NOT NULL,
	`objet` text,
	`total_ht` real NOT NULL,
	`tva` integer DEFAULT 18 NOT NULL,
	`total_ttc` real NOT NULL,
	`date_echeance` integer,
	`date_de_paiement` integer,
	`is_proforma` integer NOT NULL,
	`validite` integer NOT NULL,
	`date_de_livraison` integer,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`garantie` text NOT NULL,
	`client_id` integer,
	CONSTRAINT `fk_factures_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`)
);
--> statement-breakpoint
CREATE TABLE `ligne_produit` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`facture_id` integer,
	`produit_id` integer,
	`nombre` integer NOT NULL,
	`reduction` integer DEFAULT 0,
	CONSTRAINT `fk_ligne_produit_facture_id_factures_id_fk` FOREIGN KEY (`facture_id`) REFERENCES `factures`(`id`),
	CONSTRAINT `fk_ligne_produit_produit_id_produits_id_fk` FOREIGN KEY (`produit_id`) REFERENCES `produits`(`id`),
	CONSTRAINT "reduction_digits" CHECK("reduction" >= 0 AND "reduction" <= 100)
);
--> statement-breakpoint
CREATE TABLE `produits` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`nom` text NOT NULL,
	`description` text NOT NULL,
	`image` text,
	`prix_unitaire` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `utilisateurs` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`nom_utilisateur` text NOT NULL UNIQUE,
	`email` text NOT NULL UNIQUE,
	`mot_de_passe` text NOT NULL,
	`role` text NOT NULL,
	`actif` integer DEFAULT true NOT NULL
);
