-- Fonction pour incrémenter le solde d'un utilisateur de façon atomique
create or replace function increment_balance(user_id uuid, amount numeric)
returns void as $$
  update users
  set
    balance = balance + amount,
    total_earned = total_earned + amount,
    updated_at = now()
  where id = user_id;
$$ language sql security definer;

-- Fonction pour décrémenter le solde (retraits)
create or replace function decrement_balance(user_id uuid, amount numeric)
returns void as $$
  update users
  set
    balance = balance - amount,
    updated_at = now()
  where id = user_id;
$$ language sql security definer;
