# Spec 001 : réserver un créneau de retrait

- **Intent** : intent/001-reserver-creneau.md
- **Statut** : proposée (PR sdlc:spec) → acceptée (mergée)

## Parcours utilisateur
1. L'adhérent ouvre son lien personnel (un par commande, sans compte) dans le navigateur de son téléphone.
2. Il voit les créneaux de 15 minutes des prochaines distributions (mardi et vendredi, 17 h–19 h, heure de Paris) qui ont encore de la place.
3. Il choisit un créneau et confirme. Il voit son heure de passage, en heure de Paris.
4. Jusqu'à 24 h avant le début du créneau, il peut l'annuler ou le déplacer vers un autre créneau disponible.
5. Il reçoit un SMS de rappel 1 h avant le début de son créneau.
6. Le bénévole de permanence ouvre la liste des retraits par créneau, prépare les paniers et coche ceux qui sont récupérés.
7. Après la distribution, le nom et le téléphone sont supprimés.
8. Un adhérent sans réservation est quand même servi.

## Règles métier
- R-1 : les créneaux durent 15 minutes, le mardi et le vendredi, de 17 h à 19 h (8 créneaux par jour), heure Europe/Paris.
- R-2 : un créneau accueille 5 réservations au plus.
- R-3 : une commande a au plus une réservation active.
- R-4 : annuler ou déplacer n'est possible que jusqu'à 24 h avant le début du créneau.
- R-5 : le rappel SMS part 1 h avant le début du créneau.
- R-6 : toute heure affichée est calculée en Europe/Paris, jamais selon le fuseau du navigateur ou UTC.
- R-7 : seuls le nom et le téléphone sont conservés, pour le rappel, et supprimés après la distribution.
- R-8 : pas de compte ni de mot de passe : le lien personnel de la commande identifie l'adhérent.
- R-9 : la réservation est facultative : un adhérent sans créneau est servi.
- R-10 : le bénévole voit, par créneau, la liste des retraits et peut marquer un panier comme récupéré.

## Scénarios

### SC-1 — Réserver un créneau
- **Étant donné** un adhérent avec son lien personnel et un créneau du mardi 18 h 00 qui a de la place
- **Quand** il choisit ce créneau et confirme
- **Alors** il voit « mardi 18 h 00 » comme heure de passage

### SC-2 — Un créneau complet n'est plus proposé
- **Étant donné** un créneau qui a déjà 5 réservations
- **Quand** un autre adhérent ouvre son lien personnel
- **Alors** ce créneau est indiqué complet et ne peut pas être choisi

### SC-3 — Annuler plus de 24 h avant
- **Étant donné** un adhérent qui a réservé un créneau qui commence dans 3 jours
- **Quand** il annule
- **Alors** il n'a plus de réservation et le créneau retrouve une place

### SC-4 — Annulation refusée moins de 24 h avant
- **Étant donné** un adhérent qui a réservé un créneau qui commence dans 23 h
- **Quand** il tente d'annuler ou de déplacer
- **Alors** l'action est refusée avec un message qui explique le délai de 24 h, et la réservation reste en place

### SC-5 — Déplacer son créneau
- **Étant donné** un adhérent qui a réservé le mardi 17 h 00 (dans plus de 24 h) et un autre créneau disponible le vendredi 18 h 15
- **Quand** il déplace sa réservation vers le vendredi 18 h 15
- **Alors** il voit le vendredi 18 h 15 et le créneau du mardi 17 h 00 a une place de plus

### SC-6 — Heure de Paris quel que soit le fuseau du navigateur
- **Étant donné** un navigateur réglé sur le fuseau America/New_York
- **Quand** l'adhérent consulte un créneau qui commence à 18 h 00 à Paris
- **Alors** l'heure affichée est 18 h 00

### SC-7 — Liste des retraits pour le bénévole
- **Étant donné** deux adhérents ayant réservé le même créneau
- **Quand** le bénévole de permanence ouvre la liste de ce créneau et coche le premier panier
- **Alors** la liste montre les deux retraits, le premier comme récupéré et le second comme à récupérer

### SC-8 — Retrait sans réservation
- **Étant donné** un adhérent sans créneau
- **Quand** il se présente pendant la distribution
- **Alors** il peut être servi : le bénévole peut l'ajouter comme retrait sans créneau

### SC-9 — Accès sans compte
- **Étant donné** un lien personnel valide
- **Quand** l'adhérent l'ouvre
- **Alors** il accède à sa réservation sans inscription ni mot de passe

## Propriétés

### P-1 — Capacité jamais dépassée
Pour toute suite de réservations, annulations et déplacements, aucun créneau n'a plus de 5 réservations actives. Couvre R-2.

### P-2 — Réserver puis annuler rend l'état initial
Pour tout état et toute réservation acceptée dans un créneau à plus de 24 h, réserver puis annuler redonne l'état de départ. Couvre R-2, R-4.

### P-3 — Annuler est idempotent
Pour tout état et toute commande, annuler deux fois donne le même état qu'annuler une fois. Couvre R-3.

### P-4 — Une réservation active par commande
Pour toute suite d'opérations, une commande a au plus une réservation active, et déplacer conserve le nombre total de réservations. Couvre R-3.

### P-5 — Créneaux dans les horaires d'ouverture
Pour tout jour, les créneaux générés sont vides sauf le mardi et le vendredi (Europe/Paris), où ils sont 8, consécutifs de 15 minutes, de 17 h 00 à 19 h 00 (Paris), y compris les jours de changement d'heure. Couvre R-1.

### P-6 — Heure affichée en Europe/Paris
Pour tout instant, l'heure affichée est celle d'Europe/Paris (oracle : `Intl` avec `timeZone: 'Europe/Paris'`), indépendante du fuseau du processus. Couvre R-6.

### P-7 — Délai de 24 h
Pour tout couple (maintenant, début de créneau), la modification est autorisée si et seulement si début − maintenant ≥ 24 h. Couvre R-4.

### P-8 — Heure du rappel
Pour tout début de créneau, le rappel est programmé exactement 1 h avant. Couvre R-5.

### P-9 — Purge des données personnelles
Pour tout état, après la purge d'une distribution, aucune réservation de cette distribution ne contient de nom ni de téléphone, et celles des autres distributions restent intactes. Couvre R-7.

## Points à valider (gate 1)
- **Outil de commande** : lequel, et comment une commande est reliée à un créneau et reçoit son lien personnel ? Le plan suppose une commande identifiée par un jeton opaque, fourni par l'outil actuel (à confirmer).
- **Fournisseur SMS** : lequel, et qui paie ? Le plan l'isole derrière une interface `EnvoiSms`.
- **Rappel tardif** : réservation moins d'1 h avant le créneau. Proposition provisoire : pas de rappel.
- **Moins de 24 h avant** : libérer le créneau est-il permis ? Proposition provisoire : non, comme l'annulation (SC-4).
- **Créneau complet** : proposition provisoire : indiqué « complet » et non sélectionnable (SC-2) ; si tous sont pleins, un message indique de venir sans réservation (R-9).
- **Fermetures** : jours fériés et distributions annulées. Proposition provisoire : hors périmètre, aucune génération de créneaux pour une date fermée n'est prévue.
- **Retrait sans réservation** (SC-8) : le bénévole l'ajoute-t-il à la liste ? À confirmer.

## Hors périmètre
- Contenu du panier et gestion des commandes (restent dans l'outil actuel).
- Comptes, mots de passe, application native.
- Jours fériés et distributions annulées (tant que non tranchés).
