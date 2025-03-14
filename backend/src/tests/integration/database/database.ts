import { datasource } from "../../../datasource.config";

/**
 * Tests de connexion à la base de données
 * Ces tests vérifient que la connexion à la base de données est établie
 * et que le schéma est correctement migré
 */
export function databaseTests() {
  describe("Database connection tests", () => {
    it("should connect to the test database", async () => {
      expect(datasource.isInitialized).toBe(true);
    });

    it("should have created tables in the database", async () => {
      // Get the list of tables in the database
      const tables = await datasource.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);

      // Verify that we have at least one table
      expect(tables.length).toBeGreaterThan(0);

      // Display the tables found for debugging
      console.log(
        "Tables found:",
        tables.map((t: any) => t.table_name)
      );
    });
  });
}