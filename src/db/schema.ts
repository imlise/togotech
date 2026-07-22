import { sql } from "drizzle-orm";
import { integer,int,real, sqliteTable, text, check } from "drizzle-orm/sqlite-core";



// export const facturesTable = sqliteTable("factures", {
// 	id: int().primaryKey({ autoIncrement: true }),
// 	reference: text().notNull(),
// 	objet:text(),
// 	totalHt: real("total_ht").notNull(),
// 	tva: integer().default(18).notNull(),
// 	totalTtc: real("total_ttc").notNull(),
// 	// dateEcheance: integer("date_echeance",{ mode: 'timestamp' }),
// 	dateDePaiement: integer("date_de_paiement",{ mode: 'timestamp' }),
// 	isProforma: integer("is_proforma",{mode : 'boolean'}).notNull(),
// 	createdAt: integer("created_at",{ mode : 'timestamp'}).notNull().default(sql`(current_timestamp)`),

// 	remiseGlobale: integer("remise_globale"),

// 	//  champ condition
	
// 	delaiDeLivraison: text("delai_de_livraison"),
// 	validite: text(),
// 	garantie: text(),
// 	conditonDePaienment: text("condition_de _paiement").default("60% à l'accord et 40% à la livraison"),


// 	client: integer("client_id").references(() => clientsTable.id),
// },);


//////////////////////////////////////		Factures et ligne plus adapté au Frontend	//////////////////////////////////////

export const facturesTable = sqliteTable("factures", {
	id: int().primaryKey({ autoIncrement: true }),
	reference: text().notNull(),
	objet:text(),
  	suiviPar: text("suivi_par"),
	contact: text(),
	totalHt: real("total_ht").notNull(),
	tva: integer().default(18).notNull(),
	totalTtc: real("total_ttc").notNull(),
	// dateEcheance: integer("date_echeance",{ mode: 'timestamp' }),
	devise: text(),
	dateDePaiement: integer("date_de_paiement",{ mode: 'timestamp' }),
	isProforma: integer("is_proforma",{mode : 'boolean'}).notNull(),
	createdAt: integer("created_at",{ mode : 'timestamp'}).notNull().default(sql`(current_timestamp)`),

	remiseGlobale: integer("remise_globale"),

	//  champ condition
	condition: text("condition"),


	client: integer("client_id").references(() => clientsTable.id, { onDelete: "cascade" }),
},);


export const ligneProduitsTable = sqliteTable("ligne_produit", {
  id: integer().primaryKey({ autoIncrement: true }),

  factureId: integer("facture_id")
    .references(() => facturesTable.id, {
		onDelete: "cascade",
	}),


  nom: text().notNull(),
  description: text().notNull(),
  image: text(),

  prixUnitaire: real("prix_unitaire").notNull(),

  quantite: integer().notNull(),
  reduction:integer(),
  montant: integer(),


//   reduction: real().default(0), // en %
});














//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const clientsTable = sqliteTable("clients",{
	id : int().primaryKey({autoIncrement:true}),
	nom: text().notNull().unique(),
	email:text().unique(),
	phone:text(),
	adresse: text(),
});

export const produitsTable = sqliteTable("produits", {
	id: integer().primaryKey({ autoIncrement: true }),
	nom: text().notNull(),
	description: text().notNull(),
	image: text(),
	prixUnitaire: real("prix_unitaire").notNull(),
},
);

export const utilisateursTable = sqliteTable("utilisateurs", {
	id: integer().primaryKey({ autoIncrement: true }),
	nomUtilisateur: text("nom_utilisateur").notNull().unique(),
	email: text().notNull().unique(),
	motDePasse: text("mot_de_passe").notNull(),
	role: text({ enum: ["admin", "user"] }).notNull(),
	actif: integer({mode: "boolean",}).notNull().default(true),
});




// export const ligneProduitsTable = sqliteTable("ligne_produit", {
//   id: integer().primaryKey({ autoIncrement: true }),

//   factureId: integer("facture_id")
//     .references(() => facturesTable.id, {
// 		onDelete: "cascade",
// 	}),

//    produitId: integer("produit_id")
//      .references(() => produitsTable.id),

//   nom: text().notNull(),
//   description: text().notNull(),
//   image: text(),

//   prixUnitaire: real("prix_unitaire").notNull(),

//   quantite: integer().notNull(),

// //   reduction: real().default(0), // en %
// });

