-- Execute the unique constraints migration
-- This script ensures the constraints are properly applied

-- First, remove any potential duplicate data that might prevent constraint creation
DELETE FROM public.teams t1 
WHERE t1.ctid < (
  SELECT max(t2.ctid) 
  FROM public.teams t2 
  WHERE t1.external_id = t2.external_id 
  AND t1.sport_type = t2.sport_type 
  AND t1.game_type = t2.game_type
);

DELETE FROM public.matches m1 
WHERE m1.ctid < (
  SELECT max(m2.ctid) 
  FROM public.matches m2 
  WHERE m1.external_id = m2.external_id 
  AND m1.sport_type = m2.sport_type 
  AND m1.game_type = m2.game_type
);

DELETE FROM public.players p1 
WHERE p1.ctid < (
  SELECT max(p2.ctid) 
  FROM public.players p2 
  WHERE p1.external_id = p2.external_id 
  AND p1.sport_type = p2.sport_type 
  AND p1.game_type = p2.game_type
);

-- Now add the unique constraints
ALTER TABLE public.teams 
ADD CONSTRAINT IF NOT EXISTS teams_external_id_sport_game_unique 
UNIQUE (external_id, sport_type, game_type);

ALTER TABLE public.matches 
ADD CONSTRAINT IF NOT EXISTS matches_external_id_sport_game_unique 
UNIQUE (external_id, sport_type, game_type);

ALTER TABLE public.players 
ADD CONSTRAINT IF NOT EXISTS players_external_id_sport_game_unique 
UNIQUE (external_id, sport_type, game_type);

-- Create additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_teams_external_id ON public.teams(external_id);
CREATE INDEX IF NOT EXISTS idx_matches_external_id ON public.matches(external_id);
CREATE INDEX IF NOT EXISTS idx_players_external_id ON public.players(external_id);
