"use client";

import { startTransition } from "react";

/**
 * Par défaut, React vide un formulaire après chaque action serveur, même en cas d'erreur : l'utilisateur perd sa saisie.
 * Ce gestionnaire soumet le formulaire sans remise à zéro automatique ; on ne vide qu'après un succès, si besoin.
 */
export function keepFormSubmit(dispatch: (fd: FormData) => void) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => dispatch(fd));
  };
}
