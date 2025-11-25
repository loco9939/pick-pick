export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
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
        }
        Insert: {
          id?: string
          owner_id?: string | null
          title: string
          description?: string | null
          thumbnail_url?: string | null
          is_deleted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          owner_id?: string | null
          title?: string
          description?: string | null
          thumbnail_url?: string | null
          is_deleted?: boolean
          created_at?: string
        }
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
      }
    }
    Views: {
      worldcup_stats: {
        Row: {
          worldcup_id: string
          title: string
          candidate_count: number
          total_plays: number
        }
      }
    }
  }
}
