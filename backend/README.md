# GiftWhisper Backend

## Architecture du projet

### Configuration

Le projet utilise une architecture de configuration centralisée pour gérer les différents environnements (développement, test, production).

#### Fichiers de configuration

- **`src/datasource.config.ts`** : 
  - Point central de configuration et de connexion à la base de données
  - Détecte automatiquement l'environnement d'exécution via `process.env.NODE_ENV`
  - Configure différents paramètres selon l'environnement :
    - Pour l'environnement de développement : connexion à la base de données principale (`db:5432`)
    - Pour l'environnement de test : connexion à la base de données de test (`localhost:3002`)
  - Exporte une instance `datasource` prête à être initialisée
  - Avantages : configuration unique, adaptation automatique à l'environnement, partage d'une seule instance

## Tests

### Types de tests

Le projet est configuré pour exécuter deux types de tests:
- **Tests unitaires**: pour tester des fonctions ou des classes isolées
- **Tests d'intégration**: pour tester l'interaction entre plusieurs composants, notamment avec la base de données

### Prérequis

Les tests unitaires et d'intégration ont des prérequis différents :

- **Tests unitaires** : Aucun prérequis particulier. Les tests unitaires n'ont pas besoin de connexion à la base de données ou d'autres services externes, car ils utilisent des mocks pour simuler ces dépendances.

- **Tests d'intégration** : Nécessitent que le service `db-test` soit en cours d'exécution. Ce service est inclus dans le fichier `docker-compose.yml` principal, donc si vous avez déjà lancé l'ensemble des services avec `docker-compose up`, il devrait déjà être disponible. Sinon, vous pouvez le démarrer individuellement :

```bash
docker-compose up db-test -d
```

Note : Il n'est pas nécessaire de démarrer l'API pour exécuter les tests d'intégration, car le fichier `index.test.ts` se charge d'initialiser la connexion à la base de données de test et synchroniser celle ci avec notre schéma Appolo Server.

### Scripts

- `npm run test:unit`: Exécute tous les tests unitaires
- `npm run test:unit:watch`: Exécute les tests unitaires en mode watch
- `npm run test:integration`: Exécute tous les tests d'intégration
- `npm run test:integration:watch`: Exécute les tests d'intégration en mode watch

### Configuration des tests

Le projet utilise Jest pour les tests, avec deux configurations distinctes :
- `jest.config.ts` : Configuration pour les tests unitaires
- `jest.integration.config.ts` : Configuration pour les tests d'intégration

### Structure des tests

Tous les tests sont organisés dans un dossier central `src/tests` avec trois sous-dossiers principaux :

```
src/
  tests/
    unit/                 # Tests unitaires
      secretSanta.test.ts
    integration/          # Tests d'intégration
      index.test.ts       # Configuration pour les tests d'intégration (setup db, afterAll, beforeAll...)
      resolvers/
        user.ts
        group.ts
        chat.ts
      database/
        database.ts
    api/                  # Fonctions utilitaires pour les tests d'API
      user.ts
      group.ts
      chat.ts
```

Cette structure centralisée offre plusieurs avantages :
- Organisation cohérente pour tous les types de tests
- Séparation claire entre tests unitaires et tests d'intégration
- Organisation par fonctionnalité plutôt que par structure technique
- Facilité d'ajout de nouveaux types de tests (e2e, performance, etc.)
- Réutilisation des fonctions utilitaires d'API entre différents tests

### Fonctionnement des tests d'intégration

Lorsque vous exécutez `npm run test:integration`, voici ce qui se passe :

1. Jest utilise la configuration définie dans `jest.integration.config.ts`
2. Cette configuration spécifie `testMatch: ["**/tests/integration/**/*.test.ts"]`, ce qui fait que Jest exécute tous les fichiers de test dans le dossier integration
3. Le fichier `src/tests/integration/index.test.ts` sert de point d'entrée principal et contient :
   - Les hooks `beforeAll` et `afterAll` pour gérer la connexion à la base de données de test
   - L'initialisation du serveur Apollo pour les tests
   - L'organisation des tests en groupes logiques (Database, User resolver, Group resolver, Chat resolver)
4. Dans le hook `beforeAll` :
   - La connexion à la base de données de test est initialisée via `datasource.initialize()`
   - Les tables sont recréées avec `datasource.synchronize(true)` pour garantir un état propre
   - Un serveur Apollo de test est créé avec le schéma de l'application
5. Les tests d'intégration sont exécutés en utilisant cette configuration partagée
6. Le dossier `src/tests/api` contient des fonctions utilitaires réutilisables pour les tests d'API
7. Après l'exécution de tous les tests, le hook `afterAll` ferme la connexion à la base de données

Cette approche garantit que tous les tests d'intégration s'exécutent sur la même instance de base de données, mais avec un état propre au début de chaque suite de tests. Les tests sont organisés de manière modulaire, ce qui facilite l'ajout de nouveaux tests et la maintenance des tests existants.
