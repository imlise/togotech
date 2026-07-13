ALTER TABLE `ligne_produit` ADD `nom` text NOT NULL;--> statement-breakpoint
ALTER TABLE `ligne_produit` ADD `description` text NOT NULL;--> statement-breakpoint
ALTER TABLE `ligne_produit` ADD `image` text;--> statement-breakpoint
ALTER TABLE `ligne_produit` ADD `prix_unitaire` real NOT NULL;--> statement-breakpoint
ALTER TABLE `ligne_produit` ADD `quantite` integer NOT NULL;--> statement-breakpoint
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
	`reduction` real DEFAULT 0,
	CONSTRAINT `fk_ligne_produit_facture_id_factures_id_fk` FOREIGN KEY (`facture_id`) REFERENCES `factures`(`id`),
	CONSTRAINT `fk_ligne_produit_produit_id_produits_id_fk` FOREIGN KEY (`produit_id`) REFERENCES `produits`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_ligne_produit`(`id`, `facture_id`, `produit_id`, `reduction`) SELECT `id`, `facture_id`, `produit_id`, `reduction` FROM `ligne_produit`;--> statement-breakpoint
DROP TABLE `ligne_produit`;--> statement-breakpoint
ALTER TABLE `__new_ligne_produit` RENAME TO `ligne_produit`;--> statement-breakpoint
PRAGMA foreign_keys=ON;