# Journal de développement — Gainova
**Mis à jour en continu**

---

## Projet

- **Nom** : Gainova
- **Stack** : Next.js 14 (App Router) + Supabase + FedaPay + Tailwind CSS + TypeScript
- **Chemin local** : `/home/hack_josh/projets/gainova`
- **Supabase URL** : `https://rykhczkltblfzwmhtkqo.supabase.co`
- **Déploiement cible** : Vercel
- **Port de dev** : 3001 (3000 occupé par un autre projet)

---

## Dépendances installées

```
next@14, react, react-dom
typescript, tailwindcss, postcss, eslint
@supabase/supabase-js, @supabase/ssr
next-pwa
bcryptjs, @types/bcryptjs
nanoid
```

---

## Fichiers de configuration

| Fichier | Description |
|---|---|
| `.env.local` | Variables d'environnement (Supabase + FedaPay + App URL) |
| `.eslintrc.json` | ESLint — `no-explicit-any: off`, `no-unused-vars: warn` |
| `src/middleware.ts` | Protection des routes — redirige vers `/connexion` si non connecté |
| `src/lib/supabase/client.ts` | Client Supabase côté navigateur |
| `src/lib/supabase/server.ts` | Client Supabase côté serveur (cookies) |

---

## Variables d'environnement (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://rykhczkltblfzwmhtkqo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
FEDAPAY_SECRET_KEY=(à remplir quand compte FedaPay validé)
FEDAPAY_PUBLIC_KEY=(à remplir quand compte FedaPay validé)
FEDAPAY_WEBHOOK_SECRET=(à remplir quand compte FedaPay validé)
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=Gainova
```

---

## Supabase — Ce qui a été fait

### Tables créées (`supabase/schema.sql`)
17 tables au total :

| Table | Description |
|---|---|
| `users` | Profils utilisateurs (lié à `auth.users`) |
| `payments` | Tous les paiements entrants |
| `referrals` | Suivi des parrainages |
| `withdrawals` | Demandes de retrait Mobile Money |
| `formations` | Catalogue des formations |
| `levels` | Niveaux par formation (débutant/intermédiaire/avancé) |
| `chapters` | Chapitres par niveau |
| `quizzes` | Questions de quiz par chapitre |
| `user_progress` | Progression des apprenants |
| `user_formations` | Niveaux payants débloqués |
| `posts` | Publications communautaires |
| `post_boosts` | Boosts payants des posts |
| `prestations` | Catalogue des prestations |
| `orders` | Commandes de prestations |
| `order_files` | Fichiers liés aux commandes |
| `coaching_sessions` | Sessions de coaching |
| `notifications` | Notifications in-app |

**Ajout par rapport au schéma original** : champ `scheduled_at` dans `coaching_sessions`

### Indexes créés
```sql
create index on users(referral_code);
create index on users(referred_by);
create index on referrals(referrer_id);
create index on user_progress(user_id);
create index on posts(status, expires_at);
create index on payments(user_id, status);
create index on withdrawals(user_id, status);
create index on notifications(user_id, is_read);
```

### RLS activé sur
`users`, `payments`, `withdrawals`, `referrals`, `user_progress`, `user_formations`, `posts`, `post_boosts`, `orders`, `order_files`, `coaching_sessions`, `notifications`

### Fonction SQL créée (`supabase/functions.sql`)
```sql
create or replace function increment_balance(user_id uuid, amount numeric)
returns void as $$
  update users
  set balance = balance + amount,
      total_earned = total_earned + amount,
      updated_at = now()
  where id = user_id;
$$ language sql security definer;
```

### Données insérées (`supabase/seed.sql`)
- 19 formations du catalogue Gainova
- 3 niveaux par formation (Débutant gratuit, Intermédiaire gratuit, Avancé 500 FCFA)
- Total : 57 niveaux créés

### Cron job (`supabase/cron.sql`)
- Extension `pg_cron` activée manuellement dans Database → Extensions
- Job créé avec ID **1** — résultat SQL : `schedule 1`
- Tourne **toutes les heures** (`0 * * * *`)
- Supprime les posts dont `expires_at < now()`

### Storage
- Bucket **`gainova`** créé
- Type : **Public**
- Utilisé pour : images des posts, PDFs des chapitres de formation

### Compte de test créé
- **Email** : `test@gainova.com`
- **Password** : `test1234`
- Créé via Authentication → Add user (Auto Confirm coché)
- Profil inséré manuellement dans la table `users` :
  ```sql
  insert into users (id, email, full_name, phone, referral_code, role, is_active)
  values (
    (select id from auth.users where email = 'test@gainova.com'),
    'test@gainova.com', 'Test User', '+22900000000', 'TEST0001', 'apprenant', true
  );
  ```

---

## Pages et routes créées

### Pages publiques
| Route | Fichier | Statut |
|---|---|---|
| `/` | `src/app/page.tsx` | ✅ |
| `/rejoindre` | `src/app/rejoindre/page.tsx` | ✅ |
| `/connexion` | `src/app/connexion/page.tsx` | ✅ |

### Pages Apprenant (groupe `(app)`)
| Route | Fichier | Statut |
|---|---|---|
| `/dashboard` | `src/app/(app)/dashboard/page.tsx` | ✅ |
| `/formations` | `src/app/(app)/formations/page.tsx` | ✅ |
| `/formations/[id]` | `src/app/(app)/formations/[id]/page.tsx` | ✅ |
| `/formations/[id]/[level]/[chapter]` | `src/app/(app)/formations/[id]/[level]/[chapter]/page.tsx` | ✅ |
| `/communaute` | `src/app/(app)/communaute/page.tsx` | ✅ |
| `/communaute/publier` | `src/app/(app)/communaute/publier/page.tsx` | ✅ |
| `/parrainage` | `src/app/(app)/parrainage/page.tsx` | ✅ |
| `/retraits` | `src/app/(app)/retraits/page.tsx` | ✅ |
| `/prestations/commander` | `src/app/(app)/prestations/commander/page.tsx` | ✅ |
| `/mes-commandes` | `src/app/(app)/mes-commandes/page.tsx` | ✅ |
| `/coaching` | `src/app/(app)/coaching/page.tsx` | ✅ |
| `/profil` | `src/app/(app)/profil/page.tsx` | ✅ |

### Pages Admin
| Route | Fichier | Statut |
|---|---|---|
| `/admin` | `src/app/admin/page.tsx` | ✅ |
| `/admin/utilisateurs` | `src/app/admin/utilisateurs/page.tsx` | ✅ |
| `/admin/publications` | `src/app/admin/publications/page.tsx` | ✅ |
| `/admin/commandes` | `src/app/admin/commandes/page.tsx` | ✅ |
| `/admin/retraits` | `src/app/admin/retraits/page.tsx` | ✅ |
| `/admin/paiements` | `src/app/admin/paiements/page.tsx` | ✅ |
| `/admin/coaching` | `src/app/admin/coaching/page.tsx` | ✅ |

### API Routes
| Route | Méthode | Description | Statut |
|---|---|---|---|
| `/api/auth/inscription` | POST | Crée compte + lance paiement FedaPay | ✅ |
| `/api/fedapay/webhook` | POST | Confirme paiement + crédite parrain | ✅ |
| `/api/fedapay/callback` | GET | Redirection après paiement FedaPay | ✅ |
| `/api/formations/progress` | POST | Sauvegarde progression chapitre/quiz | ✅ |
| `/api/communaute/publier` | POST | Crée un post (avec upload image) | ✅ |
| `/api/communaute/moderer` | POST | Approuve ou rejette un post (admin) | ✅ |
| `/api/prestations` | GET | Liste du catalogue des prestations | ✅ |
| `/api/commandes` | GET | Mes commandes | ✅ |
| `/api/commandes` | POST | Créer une commande + paiement FedaPay | ✅ |
| `/api/commandes/valider` | POST | Valider une livraison | ✅ |
| `/api/coaching` | GET | Mes sessions coaching | ✅ |
| `/api/coaching` | POST | Réserver coaching + paiement FedaPay | ✅ |

---

## Composants créés

| Composant | Fichier | Description |
|---|---|---|
| `Sidebar` | `src/components/Sidebar.tsx` | Menu latéral — navigation + déconnexion |
| `CopyButton` | `src/components/CopyButton.tsx` | Bouton copier dans le presse-papier |
| `QuizSection` | `src/app/(app)/formations/[id]/[level]/[chapter]/QuizSection.tsx` | Quiz interactif avec score |

---

## Logique métier implémentée

### Inscription
1. Formulaire → API `/api/auth/inscription`
2. Vérifie le code parrain si présent
3. Crée le compte Supabase Auth
4. Crée le profil dans `users` avec `referral_code` unique (nanoid 8 chars)
5. Crée une transaction FedaPay (1 050 FCFA)
6. Redirige vers la page de paiement FedaPay

### Webhook FedaPay (paiement confirmé)
1. Reçoit l'événement `transaction.approved`
2. Met à jour le paiement → `status: 'success'`
3. Active le compte → `is_active: true`
4. Si parrain → crée un `referral` validé + crédite 210 FCFA via `increment_balance` + envoie notification

### Formations
- Chapitres débloqués un par un (quiz 70% requis pour passer au suivant)
- Niveaux débutant/intermédiaire gratuits, avancé 500 FCFA
- Progression sauvegardée dans `user_progress`

### Communauté
- Quota 5 posts/semaine vérifié côté serveur
- Upload image → Supabase Storage bucket `gainova`
- Posts en `pending` → modération admin → `approved` ou `rejected`
- Posts approuvés expirent après 48h (cron job toutes les heures)

---

## Sprints

| Sprint | Contenu | Statut |
|---|---|---|
| Sprint 1 | Setup Next.js + Supabase + Auth + Inscription + FedaPay | ✅ Terminé |
| Sprint 2 | Formations — catalogue, chapitres, quiz, progression | ✅ Terminé |
| Sprint 3 | Communauté — feed, modération, upload image, cron | ✅ Terminé |
| Sprint 4 | Parrainage — lien unique, stats, retraits Mobile Money | ✅ Terminé |
| Sprint 5 | Prestations — catalogue, commandes, livraisons, coaching | ✅ Terminé |
| Sprint 6 | Admin dashboard + PWA + profil + déploiement Vercel | ✅ Terminé |

---

## Notes importantes

- FedaPay pas encore validé — les clés API sont vides dans `.env.local`
- Le webhook FedaPay devra être configuré dans le dashboard FedaPay avec l'URL : `https://gainova.com/api/fedapay/webhook`
- Quand FedaPay sera validé, renseigner `FEDAPAY_SECRET_KEY`, `FEDAPAY_PUBLIC_KEY`, `FEDAPAY_WEBHOOK_SECRET` dans `.env.local` et dans les variables Vercel
- `NEXT_PUBLIC_APP_URL` à changer en `https://gainova.com` lors du déploiement
