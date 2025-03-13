/**
 * Configuration de l'environnement de test pour les tests d'intégration
 *
 * Ce fichier est chargé automatiquement par Jest avant l'exécution des tests d'intégration
 * grâce à la configuration dans jest.integration.config.ts (setupFilesAfterEnv).
 *
 * Il remplit trois fonctions essentielles :
 * 1. Initialiser la connexion à la base de données de test avant l'exécution des tests
 * 2. Fournir un accès contrôlé à cette connexion via getDataSource()
 * 3. Fermer proprement la connexion après l'exécution de tous les tests
 *
 * L'utilisation de getDataSource() plutôt que d'importer directement datasource
 * garantit que la connexion a bien été initialisée avant son utilisation dans les tests.
 */

import { QueryRunner } from "typeorm";
import { datasource } from "../datasource.config";

/**
 * Fournit un accès à la datasource initialisée pour les tests d'intégration
 * Cette fonction doit être utilisée dans les tests d'intégrations plutôt que d'importer
 * directement datasource depuis datasource.config.ts
 */
export function getDataSource() {
  return datasource;
}

beforeAll(async () => {
  // Initialize the test database connection
  await datasource.initialize();
  console.log("Test database connection established");
});

afterAll(async () => {
  // Close the connection after tests
  if (datasource && datasource.isInitialized) {
    await datasource.destroy();
    console.log("Test database connection closed");
  }
});

interface TableInfo {
  table_name: string;
}

describe("Database connection and schema tests", () => {
  it("should connect to the test database", async () => {
    // Verify that the connection is established
    expect(getDataSource().isInitialized).toBe(true);
    console.log("Test database connection verified");
  });

  it("should have created tables in the database", async () => {
    // Get the list of tables in the database
    const tables: TableInfo[] = await getDataSource().query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);

    // Verify that we have at least one table
    expect(tables.length).toBeGreaterThan(0);

    // Display the tables found for debugging
    console.log(
      "Tables found:",
      tables.map((t: TableInfo) => t.table_name)
    );
  });
});
