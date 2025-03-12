/**
 * Tests d'intégration pour vérifier la connexion à la base de données
 * 
 * Ces tests vérifient que :
 * 1. La connexion à la base de données de test est bien établie
 * 2. Les tables sont correctement créées dans la base de données
 * 
 * Note: Nous utilisons getDataSource() depuis setup.ts plutôt que d'importer
 * directement datasource pour garantir que la connexion a été initialisée
 * correctement avant son utilisation dans les tests.
 */

import { getDataSource } from "../../setup";

interface TableInfo {
  table_name: string;
}

describe('Database connection and schema tests', () => {
  it('should connect to the test database', async () => {
    // Verify that the connection is established
    expect(getDataSource().isInitialized).toBe(true);
    console.log('Test database connection verified');
  });
  
  it('should have created tables in the database', async () => {
    // Get the list of tables in the database
    const tables: TableInfo[] = await getDataSource().query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    // Verify that we have at least one table
    expect(tables.length).toBeGreaterThan(0);
    
    // Display the tables found for debugging
    console.log('Tables found:', tables.map((t: TableInfo) => t.table_name));
  });
}); 