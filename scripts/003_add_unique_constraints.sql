-- Add unique constraints for external_id fields to support ON CONFLICT operations

-- Add unique constraint for teams external_id with sport_type and game_type
-- This allows the same external_id across different games/sports
ALTER TABLE public.teams 
ADD CONSTRAINT teams_external_id_sport_game_unique 
UNIQUE (external_id, sport_type, game_type);

-- Add unique constraint for matches external_id with sport_type and game_type
ALTER TABLE public.matches 
ADD CONSTRAINT matches_external_id_sport_game_unique 
UNIQUE (external_id, sport_type, game_type);

-- Add unique constraint for players external_id with sport_type and game_type
ALTER TABLE public.players 
ADD CONSTRAINT players_external_id_sport_game_unique 
UNIQUE (external_id, sport_type, game_type);

-- Create additional indexes for better performance on external_id lookups
CREATE INDEX IF NOT EXISTS idx_teams_external_id ON public.teams(external_id);
CREATE INDEX IF NOT EXISTS idx_matches_external_id ON public.matches(external_id);
CREATE INDEX IF NOT EXISTS idx_players_external_id ON public.players(external_id);
