# Quiet Field — Recite

**Live site:** https://dirac1974.github.io/quiet-field/

A Yomple world for learning to recite the Gettysburg Address. Twelve lanterns on a dusk path. Look, echo, walk, mix. Optional microphone on Chrome or Safari.

Same household as Hall of Presidents, Bloom, Word Garden, and Star Map.

| Constant | Value |
|---|---|
| Module | `field` |
| Table | `field_players` |
| localStorage | `quiet-field-v1` |

## Play

1. Look at a lantern (picture, hear it, why, gesture).
2. Echo with the words hidden. Speak is optional.
3. Walk known lanterns in speech order.
4. Mix: which known line comes first?

Kid states: new → practicing → getting solid → shining. A miss resets the streak only.

## Cloud table (run once in the existing Supabase project)

```sql
create table if not exists public.field_players (
  username text primary key,
  display_name text,
  avatar text,
  pin text,
  family_code text,
  progress jsonb default '{}'::jsonb,
  fun jsonb default '{}'::jsonb,
  updated_at timestamptz default now()
);
```

Reuse `hop_families`. Enable GitHub Pages on `main` / root if the live URL 404s after the first push.
