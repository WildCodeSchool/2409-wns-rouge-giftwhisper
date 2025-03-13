/**
 * Configuration centralisée de la connexion à la base de données
 *
 * Ce fichier utilise une approche unifiée pour gérer la connexion à la base de données
 * dans différents environnements (développement, test, production).
 *
 * Avantages de cette approche :
 * - Configuration unique qui s'adapte automatiquement selon l'environnement d'exécution
 * - Pas besoin de fichiers de configuration séparés pour chaque environnement
 * - Partage d'une seule instance de connexion dans toute l'application
 * - Facilite les tests d'intégration avec une base de données dédiée
 */

import { DataSource } from "typeorm";

// Détection automatique de l'environnement
const isTest = process.env.NODE_ENV === "test";

// Configuration de la base de données selon l'environnement
export const datasource = new DataSource({
  type: "postgres",
  // En mode test, on se connecte à localhost:3002 (db-test dans docker-compose)
  // En mode développement, on se connecte à db:5432 (service principal dans docker-compose)
  host: isTest ? "localhost" : "db",
  port: isTest ? 3002 : 5432,
  username: isTest ? "test" : process.env.POSTGRES_USER,
  password: isTest ? "test" : process.env.POSTGRES_PASSWORD,
  database: isTest ? "giftwhisper_test" : process.env.POSTGRES_DB,
  entities: ["./src/entities/*.ts"],
  synchronize: true, // Crée automatiquement les tables basées sur les entités
  logging: !isTest, // Désactive les logs en mode test pour plus de clarté
});
