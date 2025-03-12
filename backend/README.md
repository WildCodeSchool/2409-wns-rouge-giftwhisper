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

Note : Il n'est pas nécessaire de démarrer l'API pour exécuter les tests d'intégration, car le fichier `setup.ts` se charge d'initialiser la connexion à la base de données de test.

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

Tous les tests sont organisés dans un dossier central `src/tests` avec deux sous-dossiers principaux :

```
src/
  tests/
    setup.ts              # Configuration commune pour les tests d'intégration
    unit/                 # Tests unitaires
      entities/
        User.test.ts
      services/
        AuthService.test.ts
    integration/          # Tests d'intégration
      auth/
        registration.integration.test.ts
        login.integration.test.ts
      groups/
        creation.integration.test.ts
      database/
        connection.integration.test.ts
```

Cette structure centralisée offre plusieurs avantages :
- Organisation cohérente pour tous les types de tests
- Séparation claire entre tests unitaires et tests d'intégration
- Organisation par fonctionnalité plutôt que par structure technique
- Facilité d'ajout de nouveaux types de tests (e2e, performance, etc.)

**Fonctionnement des tests d'intégration**

Lorsque vous exécutez `npm run test:integration`, voici ce qui se passe :

1. Jest utilise la configuration définie dans `jest.integration.config.ts`
2. Cette configuration spécifie `setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"]`, ce qui fait que Jest exécute ce fichier avant les tests
- **`src/tests/setup.ts`** : 
  - Configure l'environnement spécifique aux tests d'intégration
  - Utilise les hooks Jest (`beforeAll`, `afterAll`) pour gérer la connexion à la base de données de test
  - Initialise la connexion avant l'exécution des tests et la ferme après
  - Expose une fonction `getDataSource()` pour accéder à la connexion dans les tests d'intégration
3. Dans `setup.ts`, le hook `beforeAll` établit une connexion à la base de données de test
4. Cette connexion est partagée entre tous les tests d'intégration
5. Chaque test d'intégration peut accéder à cette connexion via `getDataSource()`
6. Après l'exécution de tous les tests, le hook `afterAll` ferme la connexion

Cela signifie que tous les tests d'intégration s'exécutent sur la même instance de base de données. C'est pourquoi il est important de nettoyer les données entre les tests si nécessaire, ou de concevoir les tests pour qu'ils n'interfèrent pas entre eux (par exemple en utilisant des identifiants uniques).

### Exemples de tests

#### Exemple de test unitaire
```typescript
// src/tests/unit/resolvers/Gift.test.ts
import { GiftResolver } from '../../../resolvers/Gift';
import { Gift } from '../../../entities/Gift';

describe('GiftResolver', () => {
  let giftResolver: GiftResolver;
  
  beforeEach(() => {
    giftResolver = new GiftResolver();
    
    // Mock de la méthode statique find() de l'entité Gift
    jest.spyOn(Gift, 'find').mockResolvedValue([
      { id: 1, title: 'Livre' } as Gift,
      { id: 2, title: 'Jeu vidéo' } as Gift
    ]);
    
    // Mock de la méthode save() pour ne pas interagir avec la DB
    jest.spyOn(Gift.prototype, 'save').mockImplementation(function(this: Gift) {
      this.id = 3; // Simuler l'attribution d'un ID par la base de données
      return Promise.resolve(this);
    });
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  it('should return all gifts', async () => {
    const result = await giftResolver.gifts();
    
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Livre');
    expect(result[1].title).toBe('Jeu vidéo');
    expect(Gift.find).toHaveBeenCalledTimes(1);
  });
  
  it('should create a new gift', async () => {
    const result = await giftResolver.createGift('Chocolats');
    
    expect(result).toBeDefined();
    expect(result.id).toBe(3);
    expect(result.title).toBe('Chocolats');
    expect(Gift.prototype.save).toHaveBeenCalledTimes(1);
  });
});
```

#### Exemple de test d'intégration

```typescript
// src/tests/integration/resolvers/gift.integration.test.ts
import { getDataSource } from '../../setup';
import { Gift } from '../../../entities/Gift';
import { GiftResolver } from '../../../resolvers/Gift';

describe('Gift Integration Tests', () => {
  let giftResolver: GiftResolver;
  
  beforeAll(async () => {
    // La connexion à la base de données est déjà établie via setup.ts
    const dataSource = getDataSource();
    
    // S'assurer que la table Gift est vide avant les tests
    await dataSource.getRepository(Gift).clear();
  });
  
  beforeEach(() => {
    giftResolver = new GiftResolver();
  });
  
  afterAll(async () => {
    // Nettoyer la table après les tests
    const dataSource = getDataSource();
    await dataSource.getRepository(Gift).clear();
  });
  
  it('should create and retrieve a gift', async () => {
    // Créer un cadeau via le resolver
    const newGift = await giftResolver.createGift('Cadeau test');
    
    // Vérifier que le cadeau a bien été créé
    expect(newGift).toBeDefined();
    expect(newGift.id).toBeDefined();
    expect(newGift.title).toBe('Cadeau test');
    
    // Récupérer tous les cadeaux via le resolver
    const gifts = await giftResolver.gifts();
    
    // Vérifier que le cadeau est bien dans la liste
    expect(gifts).toHaveLength(1);
    expect(gifts[0].id).toBe(newGift.id);
    expect(gifts[0].title).toBe('Cadeau test');
  });
});
```

### Conseils pour les tests

#### Tests unitaires
- Utilisez des mocks pour isoler les dépendances (comme dans l'exemple ci-dessus avec `jest.spyOn`)
- Testez chaque fonction de manière isolée sans dépendance à des services externes
- Concentrez-vous sur les cas limites et les conditions d'erreur
- Assurez-vous que vos tests sont rapides et ne dépendent pas de l'environnement

#### Tests d'intégration
- Testez les flux complets de l'application
- Utilisez la base de données de test (via `getDataSource()` du fichier setup.ts)
- Les tests d'intégration se connectent automatiquement à la base de données de test et vérifient que les tables sont bien créées
- Nommez vos tests de manière descriptive pour indiquer le flux testé
- Organisez les tests par fonctionnalité plutôt que par composant technique
- N'oubliez pas de nettoyer les données entre les tests pour éviter les interférences