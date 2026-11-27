# Intent 001 : réserver un créneau de retrait

- **Auteur** : bap-michaud · **Date** : 2026-11-27
- **Origine** : retour utilisateur (bénévoles et adhérents de La Cagette du Quai)

## Problème
Les adhérents commandent leur panier puis viennent le chercher au local quand ils veulent, le mardi et le vendredi de 17 h à 19 h.
- **La file** : entre 17 h 30 et 18 h 15, une vingtaine de personnes arrivent en même temps. On attend 15 à 20 minutes dehors.
- **Les autres heures** : à 18 h 30, les bénévoles n'ont presque plus personne.
- **Les paniers oubliés** : 3 à 5 paniers par distribution ne sont jamais récupérés. Les bénévoles relancent les adhérents par SMS, un par un.

## Résultat attendu
- **Pour l'adhérent** : en commandant, il choisit un créneau de retrait de 15 minutes, le mardi ou le vendredi entre 17 h et 19 h. Il connaît son heure de passage à l'avance et ne fait plus la queue.
- **Capacité** : un créneau accueille 5 personnes au plus.
- **Annulation et déplacement** : l'adhérent annule ou déplace lui-même son créneau, jusqu'à 24 h avant le début du créneau.
- **Rappel** : il reçoit un rappel par SMS 1 h avant son créneau.
- **Pour les bénévoles** : les arrivées sont étalées sur les deux heures, sans pic.

## Utilisateurs et systèmes concernés
- **Adhérents** : ils réservent, déplacent ou annulent leur créneau, sur leur téléphone surtout.
- **Bénévoles de permanence** : ils voient la liste des retraits par créneau pour préparer les paniers et cocher ceux qui sont récupérés.
- **Commandes** : elles restent dans l'outil actuel. Créneau ne gère que le créneau, pas le contenu du panier.
- **Rappel** : envoyé par SMS, comme les relances faites aujourd'hui à la main.

## Contraintes
- **Horaires** : toutes les heures sont celles du local, dans le fuseau Europe/Paris. Un adhérent en voyage voit toujours l'heure de Paris.
- **Données personnelles (RGPD)** : on garde seulement le nom et le numéro de téléphone, uniquement pour le rappel. Ils sont supprimés après la distribution.
- **Sans compte** : pas de création de compte ni de mot de passe. Un lien personnel par commande suffit.
- **Sans application** : pas d'appli à installer. Tout se fait dans le navigateur du téléphone.
- **Retrait sans réservation** : un adhérent qui arrive sans créneau est quand même servi. La réservation reste un confort, pas une obligation, au moins au début.

## Comment on saura que c'est réussi
Mesuré sur les 4 premières semaines, soit 8 distributions :
- **Attente** : aucun adhérent ayant réservé n'attend plus de 5 minutes. Relevé à la montre, sur un échantillon.
- **Adoption** : au moins 60 % des paniers sont retirés sur un créneau réservé. Compté dans la liste de chaque créneau.
- **Paniers oubliés** : 1 au plus par distribution, contre 3 à 5 aujourd'hui. Compté dans la liste de chaque créneau.
- **Relances** : les bénévoles n'envoient plus aucun SMS à la main.

## Questions ouvertes
- **Outil de commande** : lequel est utilisé aujourd'hui ? Comment Créneau relie-t-il une commande à un créneau, et comment l'adhérent reçoit-il son lien personnel ?
- **Fournisseur SMS** : lequel, et qui paie les envois ?
- **Rappel tardif** : un adhérent qui réserve moins d'1 h avant son créneau reçoit-il un rappel ?
- **Moins de 24 h avant** : un adhérent qui ne peut plus annuler ni déplacer son créneau peut-il quand même le libérer ?
- **Créneau complet** : que voit l'adhérent quand tous les créneaux sont pleins ?
- **Fermetures** : comment gère-t-on les jours fériés et les distributions annulées ?
