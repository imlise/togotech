ALTER TABLE `factures` ADD `objet` text NOT NULL;--> statement-breakpoint
ALTER TABLE `ligne_produit` ADD `reduction` integer DEFAULT 0;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ligne_produit` (
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
INSERT INTO `__new_ligne_produit`(`id`, `facture_id`, `produit_id`, `nombre`) SELECT `id`, `facture_id`, `produit_id`, `nombre` FROM `ligne_produit`;--> statement-breakpoint
DROP TABLE `ligne_produit`;--> statement-breakpoint
ALTER TABLE `__new_ligne_produit` RENAME TO `ligne_produit`;--> statement-breakpoint
PRAGMA foreign_keys=ON;