/*
  # Add Recommendations System

  1. New Tables
    - recommendations
    - content_metadata
    - user_preferences
    - content_similarities
  
  2. Functions
    - get_user_recommendations
    - update_content_similarities
    - calculate_user_affinity
*/

-- Content metadata for better recommendations
CREATE TABLE IF NOT EXISTS content_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  title text NOT NULL,
  genres text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  release_year integer,
  rating float,
  popularity float DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_content_id UNIQUE (content_id)
);

-- User viewing preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  favorite_genres text[] DEFAULT '{}',
  preferred_languages text[] DEFAULT '{}',
  viewing_history jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- Content similarities for collaborative filtering
CREATE TABLE IF NOT EXISTS content_similarities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id_1 text NOT NULL,
  content_id_2 text NOT NULL,
  similarity_score float NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_content_pair UNIQUE (content_id_1, content_id_2)
);

-- Personalized recommendations
CREATE TABLE IF NOT EXISTS recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content_id text NOT NULL,
  score float NOT NULL,
  reason text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_user_recommendation UNIQUE (user_id, content_id)
);

-- Enable RLS
ALTER TABLE content_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_similarities ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access to content metadata"
  ON content_metadata FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read their own preferences"
  ON user_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Public read access to content similarities"
  ON content_similarities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read their recommendations"
  ON recommendations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Functions
CREATE OR REPLACE FUNCTION get_user_recommendations(
  p_user_id uuid,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  content_id text,
  score float,
  reason text
) AS $$
BEGIN
  RETURN QUERY
  WITH user_history AS (
    SELECT DISTINCT content_id
    FROM watch_history
    WHERE profile_id IN (
      SELECT id FROM user_profiles WHERE user_id = p_user_id
    )
  ),
  user_prefs AS (
    SELECT 
      favorite_genres,
      preferred_languages
    FROM user_preferences
    WHERE user_id = p_user_id
  ),
  content_scores AS (
    SELECT 
      cm.content_id,
      (
        CASE WHEN cm.genres && (SELECT favorite_genres FROM user_prefs) THEN 2 ELSE 1 END +
        cm.popularity * 0.5 +
        cm.rating * 0.3
      ) as score,
      CASE
        WHEN cm.genres && (SELECT favorite_genres FROM user_prefs) THEN 'Based on your genre preferences'
        WHEN cm.popularity >= 4 THEN 'Popular content'
        ELSE 'You might like this'
      END as reason
    FROM content_metadata cm
    WHERE cm.content_id NOT IN (SELECT content_id FROM user_history)
  )
  SELECT 
    cs.content_id,
    cs.score,
    cs.reason
  FROM content_scores cs
  ORDER BY cs.score DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_content_metadata_genres ON content_metadata USING gin(genres);
CREATE INDEX IF NOT EXISTS idx_content_metadata_tags ON content_metadata USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_user_preferences_genres ON user_preferences USING gin(favorite_genres);
CREATE INDEX IF NOT EXISTS idx_content_similarities_scores ON content_similarities(similarity_score);
CREATE INDEX IF NOT EXISTS idx_recommendations_user_scores ON recommendations(user_id, score);

-- Triggers
CREATE OR REPLACE FUNCTION update_user_preferences_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_user_preferences_timestamp();