# Système d'Invitation de Groupe

Cette documentation présente le système d'invitation de groupe de l'application GiftWhisper, avec une attention particulière sur la gestion des invitations par email.

## Vue d'ensemble du processus

Le diagramme suivant illustre l'ensemble du processus d'invitation, de la création de l'invitation jusqu'à l'acceptation par l'utilisateur invité.

```mermaid
sequenceDiagram
    actor UA as Utilisateur A
    actor UB as Utilisateur B
    participant F as Frontend
    participant B as Backend
    participant DB as Base de données
    participant Mail as Service Email

    UA->>F: Invite Utilisateur B (email)
    F->>B: createInvitation(groupId, email)
    B->>B: Génère token unique
    B->>DB: Sauvegarde invitation
    B->>Mail: Envoie email avec lien + token
    Mail->>UB: Reçoit email avec lien

    UB->>F: Clique sur lien /invitation/[TOKEN]
    F->>F: Stocke TOKEN
    alt Utilisateur non connecté
        F->>UB: Affiche page connexion/inscription
        UB->>F: S'authentifie
    end
    
    F->>B: validateInvitationToken(TOKEN)
    B->>DB: Vérifie TOKEN
    
    alt Token invalide ou déjà utilisé
        B->>F: Erreur: Invitation invalide ou expirée
        F->>UB: Affiche message d'erreur
    else Token valide
        B->>DB: Vérifie si utilisateur déjà dans le groupe
        alt Utilisateur déjà membre du groupe
            B->>F: Utilisateur déjà dans le groupe
            F->>UB: "Vous êtes déjà membre de ce groupe"
            F->>UB: Redirige vers la page du groupe
        else Utilisateur pas encore membre
            B->>F: Renvoie détails groupe
            F->>UB: Notification "Voulez-vous rejoindre le groupe X?"
            UB->>F: Accepte l'invitation
            F->>B: acceptInvitation(TOKEN, userId)
            B->>DB: Ajoute utilisateur au groupe
            B->>DB: Supprime invitation (ou marque utilisée)
            B->>F: Confirmation succès
            F->>UB: Redirige vers page du groupe
        end
    end
```

## Détail de l'implémentation frontend

Le diagramme suivant détaille spécifiquement l'implémentation frontend du processus d'acceptation d'invitation :

```mermaid
sequenceDiagram
    actor User as Utilisateur
    participant Email as Client Email
    participant IH as InvitationHandler
    participant LS as LocalStorage
    participant Auth as Système d'Auth
    participant SI as Page SignIn
    participant DB as Dashboard
    participant API as Backend API

    User->>Email: Ouvre l'email d'invitation
    Email->>User: Affiche l'email avec lien d'invitation
    User->>IH: Clique sur lien /invitation/[TOKEN]
    
    IH->>LS: Stocke le token d'invitation
    
    alt Utilisateur déjà connecté
        IH->>Auth: Vérifie statut authentification
        Auth->>IH: Utilisateur authentifié
        IH->>DB: Redirige vers /dashboard?invitation=pending
        
        DB->>LS: Récupère token d'invitation
        DB->>API: validateInvitation(token)
        API->>DB: Renvoie détails du groupe
        
        DB->>User: Affiche dialogue "Accepter invitation?"
        
        alt Utilisateur accepte
            User->>DB: Clique sur "Accepter"
            DB->>API: acceptInvitation(token)
            API->>DB: Confirmation succès
            DB->>LS: Supprime token d'invitation
            DB->>User: Redirige vers page du groupe
        else Utilisateur refuse
            User->>DB: Clique sur "Refuser"
            DB->>LS: Supprime token d'invitation
        end
        
    else Utilisateur non connecté
        IH->>Auth: Vérifie statut authentification
        Auth->>IH: Utilisateur non authentifié
        IH->>SI: Redirige vers /sign-in?invitation=pending
        
        SI->>User: Affiche page connexion + notification invitation
        User->>SI: Remplit formulaire et se connecte
        SI->>Auth: Authentifie l'utilisateur
        Auth->>SI: Authentification réussie
        
        SI->>DB: Redirige vers /dashboard?invitation=pending
        
        DB->>LS: Récupère token d'invitation
        DB->>API: validateInvitation(token)
        API->>DB: Renvoie détails du groupe
        
        DB->>User: Affiche dialogue "Accepter invitation?"
        
        alt Utilisateur accepte
            User->>DB: Clique sur "Accepter"
            DB->>API: acceptInvitation(token)
            API->>DB: Confirmation succès
            DB->>LS: Supprime token d'invitation
            DB->>User: Redirige vers page du groupe
        else Utilisateur refuse
            User->>DB: Clique sur "Refuser"
            DB->>LS: Supprime token d'invitation
        end
    end
```

## Explication technique

1. **Gestion du token d'invitation**:
   - Le token est transmis via l'URL (/invitation/[TOKEN])
   - La route est interceptée par le composant InvitationHandler
   - Le token est stocké dans localStorage pour le persister à travers les redirections

2. **Processus d'authentification**:
   - Si l'utilisateur n'est pas connecté, il est redirigé vers la page de connexion
   - Le paramètre URL "?invitation=pending" est utilisé pour indiquer une invitation en attente afin d'afficher un message personnalisé à l'utilisateur 
   - Après connexion, l'utilisateur est redirigé vers le dashboard avec l'invitation toujours en attente

3. **Validation et acceptation**:
   - Le Dashboard détecte le paramètre "?invitation=pending"
   - Il récupère le token depuis localStorage
   - Il valide le token auprès du backend en faisant appel à la méthode prévue à cet effet 
   - Il affiche une boîte de dialogue permettant à l'utilisateur d'accepter ou refuser l'invitation
   - En cas d'acceptation, l'utilisateur est ajouté au groupe et redirigé vers la page du groupe
   - L'invitation est supprimée en base de donnée

Cette implémentation assure une expérience utilisateur fluide tout en maintenant un niveau de sécurité élevé pour le processus d'invitation.