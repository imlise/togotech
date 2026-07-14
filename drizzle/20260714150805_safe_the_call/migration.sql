CREATE TABLE `clients` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`nom` text NOT NULL UNIQUE,
	`email` text UNIQUE,
	`phone` text,
	`adresse` text
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
	`devise` text,
	`date_de_paiement` integer,
	`is_proforma` integer NOT NULL,
	`created_at` integer DEFAULT (current_timestamp) NOT NULL,
	`remise_globale` integer,
	`condition` text,
	`client_id` integer,
	CONSTRAINT `fk_factures_client_id_clients_id_fk` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`)
);
--> statement-breakpoint
CREATE TABLE `ligne_produit` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`facture_id` integer,
	`nom` text NOT NULL,
	`description` text NOT NULL,
	`image` text,
	`prix_unitaire` real NOT NULL,
	`quantite` integer NOT NULL,
	`reduction` integer,
	`montant` integer,
	CONSTRAINT `fk_ligne_produit_facture_id_factures_id_fk` FOREIGN KEY (`facture_id`) REFERENCES `factures`(`id`) ON DELETE CASCADE
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
