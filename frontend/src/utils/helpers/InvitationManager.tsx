/**
 * Utilitaire de gestion des invitations
 * Ce module se concentre uniquement sur la gestion du stockage des tokens d'invitation
 */

// Clé utilisée pour stocker le token d'invitation dans le sessionStorage
export const INVITATION_TOKEN_KEY = 'invitationToken';

/**
 * Récupère le token d'invitation depuis le sessionStorage
 */
export const getInvitationToken = (): string | null => {
  return sessionStorage.getItem(INVITATION_TOKEN_KEY);
};

/**
 * Enregistre le token d'invitation dans le sessionStorage
 */
export const saveInvitationToken = (token: string): void => {
  sessionStorage.setItem(INVITATION_TOKEN_KEY, token);
};

/**
 * Supprime le token d'invitation du sessionStorage
 */
export const clearInvitationToken = (): void => {
  sessionStorage.removeItem(INVITATION_TOKEN_KEY);
};

/**
 * Vérifie si une invitation est en attente
 */
export const hasInvitationPending = (): boolean => {
  return !!getInvitationToken();
};

 