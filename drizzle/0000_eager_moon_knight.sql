CREATE TABLE `clients` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nom` text NOT NULL,
	`email` text,
	`phone` text,
	`adresse` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clients_nom_unique` ON `clients` (`nom`);--> statement-breakpoint
CREATE UNIQUE INDEX `clients_email_unique` ON `clients` (`email`);--> statement-breakpoint
CREATE TABLE `factures` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`reference` text NOT NULL,
	`objet` text,
	`suivi_par` text,
	`contact` text,
	`total_ht` real NOT NULL,
	`tva` integer DEFAULT 18 NOT NULL,
	`total_ttc` real NOT NULL,
	`devise` text,
	`date_de_paiement` text,
	`is_proforma` integer NOT NULL,
	`created_at` text,
	`remise_globale` integer,
	`condition` text,
	`status` text DEFAULT 'paid',
	`updated_at` text,
	`deleted_at` text,
	`client_id` integer,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `ligne_produit` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`facture_id` integer,
	`ref` text,
	`description` text,
	`image` text,
	`prix_unitaire` real,
	`quantite` integer,
	`reduction` integer,
	`montant` integer,
	FOREIGN KEY (`facture_id`) REFERENCES `factures`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `produits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nom` text NOT NULL,
	`description` text NOT NULL,
	`image` text,
	`prix_unitaire` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `utilisateurs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nom_utilisateur` text NOT NULL,
	`email` text NOT NULL,
	`mot_de_passe` text NOT NULL,
	`role` text NOT NULL,
	`actif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `utilisateurs_nom_utilisateur_unique` ON `utilisateurs` (`nom_utilisateur`);--> statement-breakpoint
CREATE UNIQUE INDEX `utilisateurs_email_unique` ON `utilisateurs` (`email`);