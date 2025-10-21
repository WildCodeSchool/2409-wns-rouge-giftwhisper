# GiftWhisper Backend

## Architecture du projet

### Configuration

Le projet utilise une architecture de configuration centralisée pour gérer les différents environnements (développement, test, production).

#### Fichiers de configuration

- **`src/datasource.config.ts`** :
  - Point central de configuration et de connexion à la base de données
  - Détecte automatiquement l'environnement d'exécution via `process.env.NODE_ENV`
  - Configure différents paramètres selon l'environnement :
    - **Développement/Test** : `synchronize: true` - Met à jour automatiquement le schéma de la base de données
    - **Production** : `synchronize: false` - Utilise les migrations pour gérer le schéma
  - Gestion des migrations :
    - `migrations: ["./src/migrations/*.ts"]` - Chemin des fichiers de migration
    - `migrationsRun: isProduction` - Exécute automatiquement les migrations en production au démarrage
  - Exporte une instance `datasource` prête à être initialisée
  - Avantages : configuration unique, adaptation automatique à l'environnement, partage d'une seule instance

## Migrations de base de données

### Qu'est-ce qu'une migration ?

Les migrations sont un système de gestion de versions pour votre schéma de base de données. Elles permettent de :

- Suivre l'historique des modifications du schéma
- Appliquer les changements de manière contrôlée en production
- Éviter les pertes de données lors de modifications de structure
- Collaborer efficacement en équipe sur les changements de base de données

### Stratégie par environnement

| Environnement     | synchronize | migrations | Comportement                                            |
| ----------------- | ----------- | ---------- | ------------------------------------------------------- |
| **Développement** | ✅ true     | ❌         | La base de données se met à jour automatiquement        |
| **Test**          | ✅ true     | ❌         | Recréation propre à chaque test                         |
| **Production**    | ❌ false    | ✅         | Les migrations s'exécutent automatiquement au démarrage |

### Scripts disponibles

```bash
# Générer une migration (compare les entités avec la DB actuelle)
npm run migration:generate src/migrations/NomDeLaMigration

# Exécuter manuellement les migrations (normalement automatique en prod)
npm run migration:run

# Annuler la dernière migration
npm run migration:revert
```

**Note importante** : Ces commandes doivent être exécutées **dans le conteneur Docker** :

```bash
# Depuis le dossier backend
docker compose exec back npm run migration:generate src/migrations/AddPhoneToUser
```

### Workflow de développement

#### 1. Modifier le schéma en développement

```typescript
// src/entities/User.ts
@Entity()
class User {
  @Column()
  firstName: string;

  @Column() // ← Nouveau champ ajouté
  phone: string;
}
```

#### 2. Tester localement

```bash
# Lancer l'application en mode dev
npm run start

# ✨ synchronize: true met à jour la DB automatiquement
# Testez que tout fonctionne
```

#### 3. Générer la migration avant de commiter

```bash
# Depuis le dossier backend
docker compose exec back npm run migration:generate src/migrations/AddPhoneToUser

# TypeORM génère automatiquement le fichier de migration
# backend/src/migrations/1234567890-AddPhoneToUser.ts
```

#### 4. Vérifier la migration générée

```typescript
// src/migrations/1234567890-AddPhoneToUser.ts
export class AddPhoneToUser1234567890 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // ✨ Code SQL généré automatiquement par TypeORM
    await queryRunner.query(`
      ALTER TABLE "user" ADD "phone" varchar NOT NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN "phone"
    `);
  }
}
```

#### 5. Commiter et déployer

```bash
git add src/entities/User.ts src/migrations/
git commit -m "feat: add phone field to user"
git push
```

#### 6. En production

```bash
# Sur le VPS
./fetch-and-deploy.sh

# Au démarrage de l'application :
# 1. TypeORM se connecte à la base de données
# 2. Il vérifie la table "migrations"
# 3. Il exécute automatiquement les nouvelles migrations
# 4. L'application démarre avec le schéma à jour ✨
```

### Quand générer une migration ?

#### ✅ Générez une migration quand vous modifiez :

- Un champ d'une entité (ajout, suppression, modification)
- Une relation entre entités
- Une contrainte (unique, index, etc.)
- Toute modification de structure de table

#### ❌ Pas besoin de migration pour :

- Modifications de resolvers, services, ou logique métier
- Ajout de méthodes dans les entités
- Changements de code frontend
- Corrections de bugs sans impact sur le schéma

### Sécurité

**Les migrations sont sûres à commiter dans Git** car elles ne contiennent que :

- Des instructions SQL de structure (CREATE TABLE, ALTER TABLE, etc.)
- Aucune donnée sensible (pas de mots de passe, pas de données utilisateur)

⚠️ **Ne commitez JAMAIS** :

- Fichiers `.env` (contiennent les secrets)
- Dumps de base de données avec données réelles
- Clés API ou tokens

### Compatibilité PostgreSQL

Les migrations générées par TypeORM utilisent du SQL standard compatible avec toutes les versions de PostgreSQL. Vous pouvez générer une migration sur PostgreSQL 17 et l'exécuter sur PostgreSQL 18 sans problème.

### Résolution de problèmes

#### Erreur "ENOTFOUND db"

Vous essayez d'exécuter la commande en dehors de Docker. Utilisez :

```bash
docker compose exec back npm run migration:generate src/migrations/VotreMigration
```

#### "No changes in database schema were found"

Votre base de données locale est déjà synchronisée avec vos entités (grâce à `synchronize: true`). C'est normal en développement. Générez une migration uniquement si vous avez fait des modifications d'entités que vous voulez déployer en production.

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
