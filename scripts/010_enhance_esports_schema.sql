-- Enhanced database schema for comprehensive esports statistics
-- Add additional tables and indexes for better performance and analytics

-- Create tournaments table if not exists (enhanced version)
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR UNIQUE,
  name VARCHAR NOT NULL,
  slug VARCHAR,
  sport_type VARCHAR NOT NULL,
  game_type VARCHAR NOT NULL,
  begin_at TIMESTAMP WITH TIME ZONE,
  end_at TIMESTAMP WITH TIME ZONE,
  prizepool NUMERIC,
  status VARCHAR DEFAULT 'upcoming',
  league_name VARCHAR,
  league_image_url TEXT,
  serie_name VARCHAR,
  region VARCHAR,
  tier VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create match_statistics table for detailed match analytics
CREATE TABLE IF NOT EXISTS public.match_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  kills INTEGER DEFAULT 0,
  deaths INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  damage_dealt INTEGER DEFAULT 0,
  damage_taken INTEGER DEFAULT 0,
  gold_earned INTEGER DEFAULT 0,
  cs_score INTEGER DEFAULT 0, -- Creep score for MOBA games
  headshots INTEGER DEFAULT 0, -- For FPS games
  accuracy DECIMAL(5,2), -- Shooting accuracy percentage
  game_duration INTEGER, -- Duration in seconds
  additional_stats JSONB, -- Flexible stats storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create player_rankings table for leaderboards
CREATE TABLE IF NOT EXISTS public.player_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID REFERENCES public.players(id) ON DELETE CASCADE,
  sport_type VARCHAR NOT NULL,
  game_type VARCHAR NOT NULL,
  ranking_type VARCHAR NOT NULL, -- 'global', 'regional', 'tournament'
  rank_position INTEGER NOT NULL,
  rating DECIMAL(10,2),
  points INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2),
  last_match_date TIMESTAMP WITH TIME ZONE,
  season VARCHAR,
  region VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, sport_type, game_type, ranking_type, season, region)
);

-- Create team_rankings table
CREATE TABLE IF NOT EXISTS public.team_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  sport_type VARCHAR NOT NULL,
  game_type VARCHAR NOT NULL,
  ranking_type VARCHAR NOT NULL,
  rank_position INTEGER NOT NULL,
  rating DECIMAL(10,2),
  points INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2),
  last_match_date TIMESTAMP WITH TIME ZONE,
  season VARCHAR,
  region VARCHAR,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(team_id, sport_type, game_type, ranking_type, season, region)
);

-- Create match_predictions table for analytics
CREATE TABLE IF NOT EXISTS public.match_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  predicted_winner_id UUID REFERENCES public.teams(id),
  confidence_score DECIMAL(5,2),
  prediction_factors JSONB, -- Store ML model factors
  actual_winner_id UUID REFERENCES public.teams(id),
  prediction_accuracy BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_predictions table for user engagement
CREATE TABLE IF NOT EXISTS public.user_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  predicted_winner_id UUID REFERENCES public.teams(id),
  confidence_level INTEGER CHECK (confidence_level BETWEEN 1 AND 5),
  points_earned INTEGER DEFAULT 0,
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- Create analytics_cache table for performance optimization
CREATE TABLE IF NOT EXISTS public.analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key VARCHAR UNIQUE NOT NULL,
  cache_data JSONB NOT NULL,
  sport_type VARCHAR,
  game_type VARCHAR,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_matches_sport_game_status ON public.matches(sport_type, game_type, status);
CREATE INDEX IF NOT EXISTS idx_matches_date ON public.matches(match_date);
CREATE INDEX IF NOT EXISTS idx_players_team_sport ON public.players(team_id, sport_type, game_type);
CREATE INDEX IF NOT EXISTS idx_teams_sport_game ON public.teams(sport_type, game_type);
CREATE INDEX IF NOT EXISTS idx_match_statistics_match_team ON public.match_statistics(match_id, team_id);
CREATE INDEX IF NOT EXISTS idx_player_rankings_sport_rank ON public.player_rankings(sport_type, game_type, rank_position);
CREATE INDEX IF NOT EXISTS idx_team_rankings_sport_rank ON public.team_rankings(sport_type, game_type, rank_position);
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_type ON public.user_favorites(user_id, favorite_type);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_key_expires ON public.analytics_cache(cache_key, expires_at);
CREATE INDEX IF NOT EXISTS idx_tournaments_sport_status ON public.tournaments(sport_type, game_type, status);

-- Add RLS policies for new tables
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_cache ENABLE ROW LEVEL SECURITY;

-- Public read access for tournaments, rankings, and statistics
CREATE POLICY "tournaments_public_read" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "match_statistics_public_read" ON public.match_statistics FOR SELECT USING (true);
CREATE POLICY "player_rankings_public_read" ON public.player_rankings FOR SELECT USING (true);
CREATE POLICY "team_rankings_public_read" ON public.team_rankings FOR SELECT USING (true);
CREATE POLICY "match_predictions_public_read" ON public.match_predictions FOR SELECT USING (true);
CREATE POLICY "analytics_cache_public_read" ON public.analytics_cache FOR SELECT USING (true);

-- User-specific policies for predictions and favorites
CREATE POLICY "user_predictions_own_data" ON public.user_predictions 
  FOR ALL USING (auth.uid() = user_id);

-- Admin policies for data management
CREATE POLICY "tournaments_admin_all" ON public.tournaments 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "match_statistics_admin_all" ON public.match_statistics 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "player_rankings_admin_all" ON public.player_rankings 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "team_rankings_admin_all" ON public.team_rankings 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "analytics_cache_admin_all" ON public.analytics_cache 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Create functions for common analytics queries
CREATE OR REPLACE FUNCTION get_team_performance_stats(
  team_uuid UUID,
  game_type_param VARCHAR DEFAULT NULL,
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  total_matches BIGINT,
  wins BIGINT,
  losses BIGINT,
  win_rate DECIMAL,
  avg_score DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_matches,
    COUNT(*) FILTER (WHERE 
      (home_team_id = team_uuid AND home_score > away_score) OR 
      (away_team_id = team_uuid AND away_score > home_score)
    ) as wins,
    COUNT(*) FILTER (WHERE 
      (home_team_id = team_uuid AND home_score < away_score) OR 
      (away_team_id = team_uuid AND away_score < home_score)
    ) as losses,
    ROUND(
      (COUNT(*) FILTER (WHERE 
        (home_team_id = team_uuid AND home_score > away_score) OR 
        (away_team_id = team_uuid AND away_score > home_score)
      )::DECIMAL / NULLIF(COUNT(*), 0)) * 100, 2
    ) as win_rate,
    ROUND(
      AVG(CASE 
        WHEN home_team_id = team_uuid THEN home_score 
        WHEN away_team_id = team_uuid THEN away_score 
      END), 2
    ) as avg_score
  FROM public.matches 
  WHERE 
    (home_team_id = team_uuid OR away_team_id = team_uuid)
    AND status = 'finished'
    AND (game_type_param IS NULL OR game_type = game_type_param)
    AND match_date >= NOW() - INTERVAL '1 day' * days_back;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get live match count by game
CREATE OR REPLACE FUNCTION get_live_matches_count()
RETURNS TABLE (
  game_type VARCHAR,
  live_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.game_type,
    COUNT(*) as live_count
  FROM public.matches m
  WHERE m.status = 'running'
  GROUP BY m.game_type
  ORDER BY live_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_team_performance_stats TO authenticated;
GRANT EXECUTE ON FUNCTION get_live_matches_count TO authenticated;
GRANT EXECUTE ON FUNCTION get_team_performance_stats TO anon;
GRANT EXECUTE ON FUNCTION get_live_matches_count TO anon;
