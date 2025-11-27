export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          nickname: string | null
          role: string
          created_at: string
        }
        Insert: {
          id: string
          email: string
          nickname?: string | null
          role?: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          nickname?: string | null
          role?: string
          created_at?: string
        }
        Relationships: []
      }
      worldcups: {
        Row: {
          id: string
          owner_id: string | null
          title: string
          description: string | null
          thumbnail_url: string | null
          is_deleted: boolean
          created_at: string
          total_plays: number
          candidate_count: number
        }
        Insert: {
          id?: string
          owner_id?: string | null
          title: string
          description?: string | null
          thumbnail_url?: string | null
          is_deleted?: boolean
          created_at?: string
          total_plays?: number
          candidate_count?: number
        }
        Update: {
          id?: string
          owner_id?: string | null
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          is_deleted?: boolean
          created_at?: string
          total_plays?: number
          candidate_count?: number
        }
        Relationships: [
        ]
      }
      candidates: {
        Row: {
          id: string
          worldcup_id: string
          name: string
          image_url: string
          win_count: number
          match_win_count: number
          match_expose_count: number
        }
        Insert: {
          id?: string
          worldcup_id: string
          name: string
          image_url: string
          win_count?: number
          match_win_count?: number
          match_expose_count?: number
        }
        Update: {
          id?: string
          worldcup_id?: string
          name?: string
          image_url?: string
          win_count?: number
          match_win_count?: number
          match_expose_count?: number
        }
        Relationships: [
        ]
      }
      comments: {
        Row: {
          id: string
          worldcup_id: string
          user_id: string | null
          nickname: string
          content: string
          parent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          worldcup_id: string
          user_id?: string | null
          nickname: string
          content: string
          parent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          worldcup_id?: string
          user_id?: string | null
          nickname?: string
          content?: string
          parent_id?: string | null
          created_at?: string
        }
        Relationships: [
        ]
      }
    }
  }
  Views: {
  }
  Functions: {
    batch_update_candidate_stats: {
      Args: {
        updates: Json
      }
      Returns: void
    }
    increment_match_stats: {
      Args: {
        winner_id: string
        loser_id: string
      }
      Returns: void
    }
    increment_win_count: {
      Args: {
        candidate_id: string
      }
      Returns: void
    }
    increment_worldcup_stats: {
      Args: {
        worldcup_id: string
      }
      Returns: void
    }
  }
  Enums: {}
  CompositeTypes: {}
}
