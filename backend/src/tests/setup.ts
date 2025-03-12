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
  console.log('Test database connection established');
});

afterAll(async () => {
  // Close the connection after tests
  if (datasource && datasource.isInitialized) {
    await datasource.destroy();
    console.log('Test database connection closed');
  }
});
