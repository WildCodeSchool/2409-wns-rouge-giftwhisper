# 📦 Documentation de Déploiement - GiftWhisper

## Architecture de Déploiement

Le projet utilise une pipeline CI/CD automatisée avec GitHub Actions, DockerHub et un déploiement sur VPS.

- **Staging** : Déploiement entièrement automatique via webhook
- **Production** : Déploiement manuel pour un contrôle maximal

### 🔄 Flux de Déploiement

**STAGING (Automatique):**

```
┌─────────────────┐
│ Push sur staging│
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  GitHub Actions CI/CD                   │
│  • Tests automatiques (backend)         │
│  • Installation des dépendances         │
│  • Build des images Docker              │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  DockerHub Registry                     │
│  • Push des images avec tags:          │
│    - latest                             │
│    - <git-sha>                          │
└────────┬────────────────────────────────┘
         │
         ▼ (Webhook automatique)
┌─────────────────────────────────────────┐
│  Serveur VPS Staging                    │
│  • Détection automatique du push       │
│  • Exécution auto du fetch-and-deploy  │
│  • Pull des nouvelles images           │
│  • Redémarrage des containers           │
└─────────────────────────────────────────┘
```

**PRODUCTION (Manuel):**

```
┌─────────────────┐
│  Push sur main  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  GitHub Actions CI/CD                   │
│  • Tests automatiques (backend)         │
│  • Installation des dépendances         │
│  • Build des images Docker              │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  DockerHub Registry                     │
│  • Push des images avec tags:          │
│    - latest                             │
│    - <git-sha>                          │
└────────┬────────────────────────────────┘
         │
         ▼ (Intervention manuelle requise)
┌─────────────────────────────────────────┐
│  Serveur VPS Production                 │
│  • SSH sur le serveur                   │
│  • Lancement manuel du script           │
│  • Pull des nouvelles images           │
│  • Redémarrage des containers           │
└─────────────────────────────────────────┘
```

---

## 🚀 Environnements

Le projet dispose de **deux environnements** distincts :

### **Staging** (Pré-production)

- **Branches déclenchées :** `staging`
- **Workflows :** `staging-client.yml`, `staging-server.yml`
- **Images Docker :**
  - Frontend : `giftwhisper/giftwhisper-front-staging:latest`
  - Backend : `giftwhisper/giftwhisper-server-staging:latest`
- **Déploiement :** ✅ **Automatique** via webhook DockerHub
- **Objectif :** Tests et validation avant production

### **Production**

- **Branches déclenchées :** `main`
- **Workflows :** `main-client.yml`, `main-server.yml`
- **Images Docker :**
  - Frontend : `giftwhisper/giftwhisper-client:latest`
  - Backend : `giftwhisper/giftwhisper-server:latest`
- **Déploiement :** ⚠️ **Manuel** - nécessite l'exécution du script sur le VPS
- **Objectif :** Application en production accessible aux utilisateurs

---

## ⚙️ Configuration CI/CD

### Workflows GitHub Actions

Chaque push sur les branches protégées déclenche automatiquement :

#### **Pour le Backend (Server) :**

1. ✅ **Tests** (unit + integration) avec PostgreSQL de test
2. 🔨 **Build** de l'image Docker
3. 📤 **Push** vers DockerHub avec double tagging :
   - `latest` : dernière version stable
   - `<git-sha>` : version spécifique pour rollback

#### **Pour le Frontend (Client) :**

1. 📦 **Installation** des dépendances (`npm ci`)
2. 🔨 **Build** de l'image Docker
3. 📤 **Push** vers DockerHub avec double tagging

### Conditions de Déclenchement

Les workflows se déclenchent uniquement :

- **Sur PR** : Tests uniquement (pour validation)
- **Sur Push** (après merge) : Tests + Build + Push vers DockerHub

Les workflows surveillent les chemins spécifiques :

- Modifications dans `frontend/**` → workflows client
- Modifications dans `backend/**` → workflows server

---

## 🔐 Secrets et Variables Requises

### GitHub Secrets à configurer :

- `DOCKERHUB_TOKEN` : Token d'authentification DockerHub
- `TEST_POSTGRES_USER` : Utilisateur PostgreSQL pour tests
- `TEST_POSTGRES_PASSWORD` : Mot de passe PostgreSQL pour tests

### GitHub Variables :

- `DOCKERHUB_USERNAME` : Nom d'utilisateur DockerHub
- `DOCKERHUB_REPO` : Nom du repository (ex: `giftwhisper/giftwhisper`)

---

## 🖥️ Déploiement sur VPS

### Configuration du Serveur

Le serveur VPS utilise un **webhook DockerHub** qui déclenche automatiquement le déploiement lors d'un nouveau push d'image.

### Script `fetch-and-deploy`

Le script automatisé effectue les actions suivantes :

```bash
# Pull des nouvelles images depuis DockerHub
docker pull <image-name>:latest

# Redémarrage des services avec docker-compose
docker-compose -f compose.prod.yml up -d --no-build

# Nettoyage des anciennes images
docker image prune -f
```

### Fichier `compose.prod.yml`

Utilisé pour la production, ce fichier :

- Référence les images depuis DockerHub (pas de build local)
- Configure NGINX comme reverse proxy
- Monte les volumes pour persistance des données
- Gère les logs NGINX

---

## 🎯 Différences Staging vs Production

### Déploiement Staging (Automatique)

Le déploiement en staging est **entièrement automatisé** :

1. Merge d'une PR vers la branche `staging`
2. GitHub Actions build et push l'image sur DockerHub
3. Le webhook DockerHub déclenche automatiquement le script `fetch-and-deploy`
4. Le VPS staging pull et redémarre les containers automatiquement

✅ **Aucune intervention manuelle requise**

### Déploiement Production (Manuel)

Le déploiement en production nécessite une **intervention manuelle** pour plus de contrôle :

1. Merge d'une PR vers la branche `main`
2. GitHub Actions build et push l'image sur DockerHub
3. ⚠️ **Étape manuelle requise :** Se connecter au VPS et lancer le déploiement

**Commandes de déploiement en production :**

```bash
# 1. Se connecter au VPS de production
ssh user@production-vps-ip

# 2. Naviguer vers le répertoire du projet
cd /path/to/giftwhisper

# 3. Exécuter le script de déploiement
./fetch-and-deploy.sh

# OU manuellement :
docker-compose -f compose.prod.yml pull
docker-compose -f compose.prod.yml up -d

# 4. Vérifier que tout fonctionne
docker-compose -f compose.prod.yml ps
docker-compose -f compose.prod.yml logs -f
```

**Pourquoi un déploiement manuel en production ?**

- 🛡️ **Sécurité** : Contrôle total sur le moment du déploiement
- 🕐 **Timing** : Déployer pendant les heures creuses
- ✅ **Validation** : Vérification finale avant mise en production
- 🚨 **Urgence** : Possibilité d'annuler si problème détecté

---

## 🛠️ Commandes de Déploiement Manuel

### Depuis le VPS

```bash
# Se connecter au VPS
ssh user@your-vps-ip

# Naviguer vers le répertoire du projet
cd /path/to/giftwhisper

# Pull et redéployer manuellement
docker-compose -f compose.prod.yml pull
docker-compose -f compose.prod.yml up -d

# Voir les logs en temps réel
docker-compose -f compose.prod.yml logs -f

# Vérifier l'état des services
docker-compose -f compose.prod.yml ps
```

### Rollback vers une version précédente

```bash
# Lister les versions disponibles sur DockerHub
# ou utiliser le SHA du commit

# Modifier le tag dans compose.prod.yml ou
docker-compose -f compose.prod.yml pull
docker tag giftwhisper/giftwhisper-server:<git-sha> giftwhisper/giftwhisper-server:latest
docker-compose -f compose.prod.yml up -d
```

---

## 📊 Monitoring et Logs

### Consultation des Logs

```bash
# Logs de tous les services
docker-compose -f compose.prod.yml logs -f

# Logs d'un service spécifique
docker-compose -f compose.prod.yml logs -f back
docker-compose -f compose.prod.yml logs -f front
docker-compose -f compose.prod.yml logs -f nginx

# Logs NGINX (montés dans ./logs)
tail -f ./logs/access.log
tail -f ./logs/error.log
```

### Vérification de l'état des services

```bash
# Status des containers
docker-compose -f compose.prod.yml ps

# Ressources utilisées
docker stats

# Espace disque
docker system df
```

---

## 🚨 Troubleshooting

### Le webhook ne se déclenche pas

1. Vérifier la configuration du webhook sur DockerHub
2. Vérifier que le serveur VPS est accessible depuis internet
3. Consulter les logs du service webhook sur le VPS

### Les containers ne démarrent pas

```bash
# Vérifier les logs
docker-compose -f compose.prod.yml logs

# Vérifier que les images sont à jour
docker-compose -f compose.prod.yml pull

# Redémarrer complètement
docker-compose -f compose.prod.yml down
docker-compose -f compose.prod.yml up -d
```

### Espace disque insuffisant

```bash
# Nettoyer les anciennes images
docker image prune -a -f

# Nettoyer les volumes non utilisés
docker volume prune -f

# Voir l'utilisation disque
docker system df
```

### Variables d'environnement manquantes

```bash
# Vérifier que le fichier .env existe
ls -la .env

# Vérifier les variables d'environnement dans les containers
docker-compose -f compose.prod.yml exec back env
docker-compose -f compose.prod.yml exec front env
```

### Base de données inaccessible

```bash
# Vérifier que le container PostgreSQL est démarré
docker-compose -f compose.prod.yml ps db

# Vérifier les logs de la base de données
docker-compose -f compose.prod.yml logs db

# Tester la connexion depuis le backend
docker-compose -f compose.prod.yml exec back npm run typeorm -- migration:show
```

---

## 📝 Notes Importantes

- ⚠️ Les branches `main` et `staging` sont **protégées** : toute modification nécessite une Pull Request
- 🔄 **Staging** : déploiement automatique via webhook | **Production** : déploiement manuel requis
- 🏷️ Chaque build est **taggé** avec le SHA du commit pour faciliter les rollbacks
- 🧪 Les tests backend sont **obligatoires** avant le build de l'image
- 📦 Les images de production sont stockées sur **DockerHub** (registry public/privé)
- 🔒 Ne jamais commiter le fichier `.env` contenant les secrets de production
- 🔄 Les volumes Docker persistent les données entre les redémarrages
- 📈 Surveiller régulièrement l'espace disque du VPS

---

## 🔄 Workflow de Déploiement Recommandé

1. **Développement** sur une branche feature :

   ```bash
   git checkout -b feature/ma-nouvelle-fonctionnalite
   # Développement...
   git add .
   git commit -m "feat: description"
   git push origin feature/ma-nouvelle-fonctionnalite
   ```

2. **Pull Request vers staging** :

   - Créer une PR de `feature/ma-nouvelle-fonctionnalite` vers `staging`
   - Les tests CI/CD s'exécutent automatiquement
   - Code review par l'équipe
   - Merge après validation

3. **Déploiement automatique sur staging** :

   - Le merge déclenche les workflows `staging-*`
   - Les images sont buildées et pushées sur DockerHub
   - ✅ **Le webhook déclenche automatiquement le déploiement sur le VPS staging**

4. **Tests et validation sur staging** :

   - Tester la fonctionnalité en environnement staging
   - Vérifier que tout fonctionne correctement

5. **Pull Request vers production** :

   - Créer une PR de `staging` vers `main`
   - Validation finale par l'équipe
   - Merge après approbation

6. **Déploiement manuel en production** :

   - Le merge déclenche les workflows `main-*`
   - Les images sont buildées et pushées sur DockerHub
   - ⚠️ **Connexion SSH au VPS de production requise**
   - Exécution manuelle du script `fetch-and-deploy.sh`
   - Vérification du bon fonctionnement des services

---

## 📚 Ressources Complémentaires

- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [Documentation GitHub Actions](https://docs.github.com/en/actions)
- [Documentation DockerHub](https://docs.docker.com/docker-hub/)
- [Documentation NGINX](https://nginx.org/en/docs/)
