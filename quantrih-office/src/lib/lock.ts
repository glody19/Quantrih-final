/** Durée du blocage après trop d'échecs, en minutes : il se lève seul ensuite (l'administrateur peut aussi le lever). */
export const LOCK_MINUTES = 15;
/** Le blocage est-il encore en cours ? */
export const lockActive = (lockedAt: Date | null) => !!lockedAt && Date.now() - new Date(lockedAt).getTime() < LOCK_MINUTES * 60_000;
