export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company: string | null
          phone: string | null
          role: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company?: string | null
          phone?: string | null
          role?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company?: string | null
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          title: string
          client_name: string
          project_type: string
          location: string | null
          description: string | null
          status: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          client_name: string
          project_type: string
          location?: string | null
          description?: string | null
          status?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          client_name?: string
          project_type?: string
          location?: string | null
          description?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          id: string
          project_id: string
          room_name: string
          floor: string | null
          category: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          room_name: string
          floor?: string | null
          category?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          room_name?: string
          floor?: string | null
          category?: string | null
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      boq_items: {
        Row: {
          id: string
          project_id: string
          room_id: string | null
          category: string
          item_name: string
          specification: string | null
          quantity: number
          unit: string
          base_rate: number
          luxury_tier: string
          final_rate: number
          total_amount: number
          remarks: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          room_id?: string | null
          category: string
          item_name: string
          specification?: string | null
          quantity: number
          unit: string
          base_rate: number
          luxury_tier?: string
          final_rate: number
          total_amount: number
          remarks?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          project_id?: string
          room_id?: string | null
          category?: string
          item_name?: string
          specification?: string | null
          quantity?: number
          unit?: string
          base_rate?: number
          luxury_tier?: string
          final_rate?: number
          total_amount?: number
          remarks?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "boq_items_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "boq_items_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_master: {
        Row: {
          id: string
          category: string
          item_name: string
          unit: string
          standard_rate: number
          premium_rate: number
          luxury_rate: number
          super_luxury_rate: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: string
          item_name: string
          unit: string
          standard_rate: number
          premium_rate: number
          luxury_rate: number
          super_luxury_rate: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          category?: string
          item_name?: string
          unit?: string
          standard_rate?: number
          premium_rate?: number
          luxury_rate?: number
          super_luxury_rate?: number
          updated_at?: string
        }
        Relationships: []
      }
      uploaded_files: {
        Row: {
          id: string
          project_id: string
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          file_name: string
          file_type: string
          file_size: number
          storage_path: string
          uploaded_by: string
          created_at?: string
        }
        Update: {
          file_name?: string
          file_type?: string
          file_size?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_files_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uploaded_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_links: {
        Row: {
          id: string
          project_id: string
          token: string
          expires_at: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          token: string
          expires_at?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_links_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shared_links_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      project_versions: {
        Row: {
          id: string
          project_id: string
          version_number: number
          snapshot: Record<string, unknown>
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          version_number: number
          snapshot: Record<string, unknown>
          created_by: string
          created_at?: string
        }
        Update: {
          snapshot?: Record<string, unknown>
        }
        Relationships: [
          {
            foreignKeyName: "project_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_versions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

// Convenience type aliases
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Project = Database['public']['Tables']['projects']['Row']
export type Room = Database['public']['Tables']['rooms']['Row']
export type BoqItem = Database['public']['Tables']['boq_items']['Row']
export type RateMaster = Database['public']['Tables']['rate_master']['Row']
export type UploadedFile = Database['public']['Tables']['uploaded_files']['Row']
export type SharedLink = Database['public']['Tables']['shared_links']['Row']
export type ProjectVersion = Database['public']['Tables']['project_versions']['Row']
