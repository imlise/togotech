CREATE TABLE `utilisateurs` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`nom_utilisateur` text NOT NULL UNIQUE,
	`email` text NOT NULL UNIQUE,
	`mot_de_passe` text NOT NULL,
	`role` text NOT NULL,
	`actif` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
DROP TABLE `utilisateur`;