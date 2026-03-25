export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      weddings: {
        Row: {
          id: string;
          bride_name: string;
          groom_name: string;
          wedding_date: string;
          venue_name: string;
          created_at: string;
          // Added in 005_schema_additions.sql
          venue_address: string | null;
          venue_city: string | null;
          contact_email: string | null;
          dress_code: string | null;
        };
        Insert: {
          id?: string;
          bride_name: string;
          groom_name: string;
          wedding_date: string;
          venue_name: string;
          created_at?: string;
          venue_address?: string | null;
          venue_city?: string | null;
          contact_email?: string | null;
          dress_code?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["weddings"]["Insert"]>;
        Relationships: [
          // No inbound FKs on weddings — it is the root entity
        ];
      };
      guests: {
        Row: {
          id: string;
          wedding_id: string;
          guest_name: string;
          family_name: string | null;
          phone: string | null;
          invite_code: string;
          invite_opened: boolean;
          device_type: string | null;
          opened_at: string | null;
          // Phase 7 — Guest Journey role badge (added in 008_guest_predictions.sql)
          guest_role: "family" | "friends" | "bride_side" | "groom_side" | "vip" | null;
          // Added in missing-features SQL
          city: string | null;
          country: string | null;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          guest_name: string;
          family_name?: string | null;
          phone?: string | null;
          invite_code: string;
          invite_opened?: boolean;
          device_type?: string | null;
          opened_at?: string | null;
          guest_role?: "family" | "friends" | "bride_side" | "groom_side" | "vip" | null;
          city?: string | null;
          country?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["guests"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fk_guests_wedding_id";
            columns: ["wedding_id"];
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      rsvp: {
        Row: {
          id: string;
          guest_id: string;
          attending: boolean;
          guest_count: number;
          message: string | null;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          guest_id: string;
          attending: boolean;
          guest_count?: number;
          message?: string | null;
          submitted_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["rsvp"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fk_rsvp_guest_id";
            columns: ["guest_id"];
            referencedRelation: "guests";
            referencedColumns: ["id"];
          }
        ];
      };
      events: {
        Row: {
          id: string;
          wedding_id: string;
          event_name: string;
          date: string;
          time: string;
          venue: string;
          map_link: string;
          // Added in 005_schema_additions.sql
          description: string | null;
          dress_code: string | null;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          event_name: string;
          date: string;
          time: string;
          venue: string;
          map_link: string;
          description?: string | null;
          dress_code?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["events"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fk_events_wedding_id";
            columns: ["wedding_id"];
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      guest_messages: {
        Row: {
          id: string;
          guest_name: string;
          message: string;
          wedding_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          guest_name: string;
          message: string;
          wedding_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["guest_messages"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fk_guest_messages_wedding_id";
            columns: ["wedding_id"];
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      photos: {
        Row: {
          id: string;
          wedding_id: string;
          image_url: string;
          uploaded_by: string;
          category: string;
          created_at: string;
          // Added in 006_photo_moderation.sql
          is_approved: boolean;
          // Added in 009_new_admin_modules.sql
          album_id: string | null;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          image_url: string;
          uploaded_by: string;
          category: string;
          created_at?: string;
          is_approved?: boolean;
          album_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["photos"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fk_photos_wedding_id";
            columns: ["wedding_id"];
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      videos: {
        Row: {
          id: string;
          wedding_id: string;
          title: string;
          video_url: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          title: string;
          video_url: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["videos"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fk_videos_wedding_id";
            columns: ["wedding_id"];
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      travel_info: {
        Row: {
          id: string;
          wedding_id: string;
          title: string;
          description: string;
          link: string;
          // Added in missing-features SQL
          category: "hotel" | "transport" | "essentials" | "local" | "general" | null;
          icon: string | null;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          title: string;
          description: string;
          link: string;
          category?: "hotel" | "transport" | "essentials" | "local" | "general" | null;
          icon?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["travel_info"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fk_travel_info_wedding_id";
            columns: ["wedding_id"];
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      invite_analytics: {
        Row: {
          id: string;
          guest_id: string;
          action: string;
          device: string | null;
          timestamp: string;
        };
        Insert: {
          id?: string;
          guest_id: string;
          action: string;
          device?: string | null;
          timestamp?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invite_analytics"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fk_invite_analytics_guest_id";
            columns: ["guest_id"];
            referencedRelation: "guests";
            referencedColumns: ["id"];
          }
        ];
      };
      family_users: {
        Row: {
          id: string;
          email: string;
          role: "family" | "squad" | "admin";
          password_hash: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          role: "family" | "squad" | "admin";
          password_hash?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["family_users"]["Insert"]>;
        Relationships: [];
      };
      family_posts: {
        Row: {
          id: string;
          wedding_id: string;
          title: string;
          content: string;
          media_url: string | null;
          created_at: string;
          // Added in missing-features SQL
          posted_by: string | null;
          post_type: "memory" | "blessing" | "milestone" | "anniversary" | null;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          title: string;
          content: string;
          media_url?: string | null;
          created_at?: string;
          posted_by?: string | null;
          post_type?: "memory" | "blessing" | "milestone" | "anniversary" | null;
        };
        Update: Partial<Database["public"]["Tables"]["family_posts"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fk_family_posts_wedding_id";
            columns: ["wedding_id"];
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── Previously untyped tables (Phase 3.3) ──────────────────────────────
      // These were queried with (client as any) casts before this migration.

      family_magic_links: {
        Row: {
          id: string;
          family_user_id: string;
          email: string;
          token_hash: string;
          redirect_to: string;
          expires_at: string;
          consumed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          family_user_id: string;
          email: string;
          token_hash: string;
          redirect_to?: string;
          expires_at: string;
          consumed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["family_magic_links"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fk_family_magic_links_family_user_id";
            columns: ["family_user_id"];
            referencedRelation: "family_users";
            referencedColumns: ["id"];
          }
        ];
      };

      invite_access_codes: {
        Row: {
          id: string;
          code_hash: string;
          family_user_id: string | null;
          email: string | null;
          role: "family" | "squad" | "admin" | null;
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          code_hash: string;
          family_user_id?: string | null;
          email?: string | null;
          role?: "family" | "squad" | "admin" | null;
          expires_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invite_access_codes"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fk_invite_access_codes_family_user_id";
            columns: ["family_user_id"];
            referencedRelation: "family_users";
            referencedColumns: ["id"];
          }
        ];
      };

      wedding_stage_overrides: {
        Row: {
          id: string;
          wedding_id: string;
          stage: "invitation" | "live" | "vault" | null;
          private_mode: boolean;
          live_starts_at: string | null;
          live_ends_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          stage?: "invitation" | "live" | "vault" | null;
          private_mode?: boolean;
          live_starts_at?: string | null;
          live_ends_at?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["wedding_stage_overrides"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fk_wedding_stage_overrides_wedding_id";
            columns: ["wedding_id"];
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── time_capsules (Phase 7 — Wedding Time Capsule) ────────────────────
      time_capsules: {
        Row: {
          id: string;
          wedding_id: string;
          author_name: string;
          author_email: string | null;
          message: string;
          media_url: string | null;
          post_type: "anniversary" | "life_event" | "timed" | "video";
          unlock_date: string;
          is_revealed: boolean;
          notify_sent: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          author_name: string;
          author_email?: string | null;
          message: string;
          media_url?: string | null;
          post_type?: "anniversary" | "life_event" | "timed" | "video";
          unlock_date: string;
          is_revealed?: boolean;
          notify_sent?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["time_capsules"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fk_time_capsules_wedding_id";
            columns: ["wedding_id"];
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── guest_predictions (Phase 7 — Guest Journey) ───────────────────────
      guest_predictions: {
        Row: {
          id: string;
          wedding_id: string;
          question_id: string;
          answer: string;
          guest_name: string;
          guest_identifier: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          question_id: string;
          answer: string;
          guest_name: string;
          guest_identifier: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["guest_predictions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fk_guest_predictions_wedding_id";
            columns: ["wedding_id"];
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      // ── vendors (missing-features SQL) ───────────────────────────────────
      vendors: {
        Row: {
          id: string;
          wedding_id: string;
          vendor_name: string;
          role: string;
          contact_phone: string | null;
          contact_email: string | null;
          arrival_time: string | null;
          setup_notes: string | null;
          status: "pending" | "confirmed" | "arrived" | "done";
          created_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          vendor_name: string;
          role: string;
          contact_phone?: string | null;
          contact_email?: string | null;
          arrival_time?: string | null;
          setup_notes?: string | null;
          status?: "pending" | "confirmed" | "arrived" | "done";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vendors"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fk_vendors_wedding";
            columns: ["wedding_id"];
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── family_polls (missing-features SQL) ──────────────────────────────
      family_polls: {
        Row: {
          id: string;
          wedding_id: string;
          question: string;
          options: string[];
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          wedding_id: string;
          question: string;
          options: string[];
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["family_polls"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fk_family_polls_wedding";
            columns: ["wedding_id"];
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };

      family_poll_votes: {
        Row: {
          id: string;
          poll_id: string;
          voter_email: string;
          answer: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          poll_id: string;
          voter_email: string;
          answer: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["family_poll_votes"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fk_family_poll_votes_poll";
            columns: ["poll_id"];
            referencedRelation: "family_polls";
            referencedColumns: ["id"];
          }
        ];
      };

      // ── 012_squad_proposals.sql ──────────────────────────────────────────────
      squad_proposals: {
        Row: {
          id:            string;
          wedding_id:    string;
          name:          string;
          email:         string | null;
          squad_role:    "bridesmaid" | "groomsman";
          personal_note: string;
          proposal_code: string;
          accepted:              boolean | null;
          accepted_at:           string | null;
          response_note:         string | null;
          created_at:            string;
          opened_at:             string | null;
          profile_full_name:      string | null;
          profile_phone:          string | null;
          profile_photo_url:      string | null;
          profile_dress_size:     string | null;
          profile_dietary:        string | null;
          profile_emergency_name: string | null;
          profile_emergency_phone:string | null;
          profile_completed_at:   string | null;
        };
        Insert: {
          id?:            string;
          wedding_id:     string;
          name:           string;
          email?:         string | null;
          squad_role:     "bridesmaid" | "groomsman";
          personal_note:  string;
          proposal_code:  string;
          accepted?:              boolean | null;
          accepted_at?:           string | null;
          response_note?:         string | null;
          created_at?:            string;
          opened_at?:             string | null;
          profile_full_name?:      string | null;
          profile_phone?:          string | null;
          profile_photo_url?:      string | null;
          profile_dress_size?:     string | null;
          profile_dietary?:        string | null;
          profile_emergency_name?: string | null;
          profile_emergency_phone?:string | null;
          profile_completed_at?:   string | null;
        };
        Update: Partial<Database["public"]["Tables"]["squad_proposals"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fk_squad_proposals_wedding";
            columns: ["wedding_id"];
            referencedRelation: "weddings";
            referencedColumns: ["id"];
          }
        ];
      };
      family_post_reactions: {
        Row: {
          id:         string;
          post_id:    string;
          emoji:      string;
          reacted_by: string;
          created_at: string;
        };
        Insert: {
          id?:        string;
          post_id:    string;
          emoji:      string;
          reacted_by: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["family_post_reactions"]["Insert"]>;
        Relationships: [
          {
            foreignKeyName: "fk_family_post_reactions_post";
            columns: ["post_id"];
            referencedRelation: "family_posts";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
