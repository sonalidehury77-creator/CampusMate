export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage: {
        Row: {
          created_at: string
          feature: string
          id: string
          profile_id: string
          request_count: number
          tokens_used: number
          usage_date: string
        }
        Insert: {
          created_at?: string
          feature: string
          id?: string
          profile_id: string
          request_count?: number
          tokens_used?: number
          usage_date?: string
        }
        Update: {
          created_at?: string
          feature?: string
          id?: string
          profile_id?: string
          request_count?: number
          tokens_used?: number
          usage_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_status: {
        Row: {
          assignment_id: string
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          status: string
          student_id: string
          updated_at: string
        }
        Insert: {
          assignment_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          student_id: string
          updated_at?: string
        }
        Update: {
          assignment_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          status?: string
          student_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_status_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_status_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          attachment_url: string | null
          created_at: string
          description: string | null
          due_date: string | null
          faculty_id: string | null
          id: string
          priority: string
          subject_id: string
          title: string
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          faculty_id?: string | null
          id?: string
          priority?: string
          subject_id: string
          title: string
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          faculty_id?: string | null
          id?: string
          priority?: string
          subject_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          id: string
          marked_at: string
          session_id: string
          status: string
          student_id: string
        }
        Insert: {
          id?: string
          marked_at?: string
          session_id: string
          status: string
          student_id: string
        }
        Update: {
          id?: string
          marked_at?: string
          session_id?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "attendance_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_sessions: {
        Row: {
          created_at: string
          faculty_id: string | null
          id: string
          session_date: string
          subject_id: string
          timetable_entry_id: string | null
        }
        Insert: {
          created_at?: string
          faculty_id?: string | null
          id?: string
          session_date: string
          subject_id: string
          timetable_entry_id?: string | null
        }
        Update: {
          created_at?: string
          faculty_id?: string | null
          id?: string
          session_date?: string
          subject_id?: string
          timetable_entry_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_sessions_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_sessions_timetable_entry_id_fkey"
            columns: ["timetable_entry_id"]
            isOneToOne: false
            referencedRelation: "timetable_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json
          profile_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          profile_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json
          profile_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      exams: {
        Row: {
          created_at: string
          end_time: string | null
          exam_date: string
          exam_type: string
          id: string
          room: string | null
          semester_id: string
          start_time: string | null
          subject_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_time?: string | null
          exam_date: string
          exam_type?: string
          id?: string
          room?: string | null
          semester_id: string
          start_time?: string | null
          subject_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_time?: string | null
          exam_date?: string
          exam_type?: string
          id?: string
          room?: string | null
          semester_id?: string
          start_time?: string | null
          subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exams_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exams_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty: {
        Row: {
          created_at: string
          department_id: string
          designation: string | null
          employee_number: string
          id: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          department_id: string
          designation?: string | null
          employee_number: string
          id?: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          department_id?: string
          designation?: string | null
          employee_number?: string
          id?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculty_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      faculty_subjects: {
        Row: {
          academic_year: string
          created_at: string
          faculty_id: string
          id: string
          subject_id: string
        }
        Insert: {
          academic_year: string
          created_at?: string
          faculty_id: string
          id?: string
          subject_id: string
        }
        Update: {
          academic_year?: string
          created_at?: string
          faculty_id?: string
          id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "faculty_subjects_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faculty_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      focus_sessions: {
        Row: {
          completed: boolean
          created_at: string
          duration_minutes: number | null
          ended_at: string | null
          id: string
          session_type: string
          started_at: string
          student_id: string
          subject_id: string | null
        }
        Insert: {
          completed?: boolean
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          session_type?: string
          started_at: string
          student_id: string
          subject_id?: string | null
        }
        Update: {
          completed?: boolean
          created_at?: string
          duration_minutes?: number | null
          ended_at?: string | null
          id?: string
          session_type?: string
          started_at?: string
          student_id?: string
          subject_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "focus_sessions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "focus_sessions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          student_id: string
          subject_id: string | null
          title: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          student_id: string
          subject_id?: string | null
          title: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          student_id?: string
          subject_id?: string | null
          title?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "syllabus_units"
            referencedColumns: ["id"]
          },
        ]
      }
      notice_extractions: {
        Row: {
          ai_status: string
          created_at: string
          extracted_dates: Json
          extracted_deadlines: Json
          extracted_text: string | null
          id: string
          notice_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          suggested_category: string | null
          suggested_priority: string | null
          summary: string | null
        }
        Insert: {
          ai_status?: string
          created_at?: string
          extracted_dates?: Json
          extracted_deadlines?: Json
          extracted_text?: string | null
          id?: string
          notice_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          suggested_category?: string | null
          suggested_priority?: string | null
          summary?: string | null
        }
        Update: {
          ai_status?: string
          created_at?: string
          extracted_dates?: Json
          extracted_deadlines?: Json
          extracted_text?: string | null
          id?: string
          notice_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          suggested_category?: string | null
          suggested_priority?: string | null
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notice_extractions_notice_id_fkey"
            columns: ["notice_id"]
            isOneToOne: true
            referencedRelation: "notices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notice_extractions_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          attachment_path: string | null
          category: string
          created_at: string
          created_by: string | null
          deadline: string | null
          description: string | null
          id: string
          priority: string
          published_at: string | null
          source: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          attachment_path?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          priority?: string
          published_at?: string | null
          source?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          attachment_path?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: string
          priority?: string
          published_at?: string | null
          source?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          ai_notifications: boolean
          assignment_notifications: boolean
          attendance_notifications: boolean
          email_notifications: boolean
          event_notifications: boolean
          id: string
          notice_notifications: boolean
          profile_id: string
          push_notifications: boolean
          timetable_notifications: boolean
          updated_at: string
        }
        Insert: {
          ai_notifications?: boolean
          assignment_notifications?: boolean
          attendance_notifications?: boolean
          email_notifications?: boolean
          event_notifications?: boolean
          id?: string
          notice_notifications?: boolean
          profile_id: string
          push_notifications?: boolean
          timetable_notifications?: boolean
          updated_at?: string
        }
        Update: {
          ai_notifications?: boolean
          assignment_notifications?: boolean
          attendance_notifications?: boolean
          email_notifications?: boolean
          event_notifications?: boolean
          id?: string
          notice_notifications?: boolean
          profile_id?: string
          push_notifications?: boolean
          timetable_notifications?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          priority: string
          read_at: string | null
          recipient_profile_id: string
          related_entity_id: string | null
          related_entity_type: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          priority?: string
          read_at?: string | null
          recipient_profile_id: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          priority?: string
          read_at?: string | null
          recipient_profile_id?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_recipient_profile_id_fkey"
            columns: ["recipient_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      programs: {
        Row: {
          code: string
          created_at: string
          department_id: string
          duration: number | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          department_id: string
          duration?: number | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          department_id?: string
          duration?: number | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string
          description: string | null
          external_url: string | null
          id: string
          resource_type: string
          storage_path: string | null
          subject_id: string | null
          title: string
          unit_id: string | null
          updated_at: string
          uploaded_by: string | null
          visibility: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          id?: string
          resource_type?: string
          storage_path?: string | null
          subject_id?: string | null
          title: string
          unit_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          visibility?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          external_url?: string | null
          id?: string
          resource_type?: string
          storage_path?: string | null
          subject_id?: string | null
          title?: string
          unit_id?: string | null
          updated_at?: string
          uploaded_by?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "syllabus_units"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      semesters: {
        Row: {
          academic_year: string
          created_at: string
          id: string
          program_id: string
          semester_number: number
          updated_at: string
        }
        Insert: {
          academic_year: string
          created_at?: string
          id?: string
          program_id: string
          semester_number: number
          updated_at?: string
        }
        Update: {
          academic_year?: string
          created_at?: string
          id?: string
          program_id?: string
          semester_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "semesters_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      student_subject_progress: {
        Row: {
          id: string
          progress_percentage: number
          student_id: string
          subject_id: string
          updated_at: string
        }
        Insert: {
          id?: string
          progress_percentage?: number
          student_id: string
          subject_id: string
          updated_at?: string
        }
        Update: {
          id?: string
          progress_percentage?: number
          student_id?: string
          subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_subject_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_subject_progress_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      student_subjects: {
        Row: {
          academic_year: string
          created_at: string
          id: string
          student_id: string
          subject_id: string
        }
        Insert: {
          academic_year: string
          created_at?: string
          id?: string
          student_id: string
          subject_id: string
        }
        Update: {
          academic_year?: string
          created_at?: string
          id?: string
          student_id?: string
          subject_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_subjects_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_subjects_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          created_at: string
          current_semester: number | null
          enrollment_year: number | null
          id: string
          profile_id: string
          program_id: string
          semester_id: string
          student_number: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_semester?: number | null
          enrollment_year?: number | null
          id?: string
          profile_id: string
          program_id: string
          semester_id: string
          student_number: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_semester?: number | null
          enrollment_year?: number | null
          id?: string
          profile_id?: string
          program_id?: string
          semester_id?: string
          student_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "students_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "students_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plan_items: {
        Row: {
          completed_at: string | null
          created_at: string
          duration_minutes: number
          id: string
          priority: string
          start_time: string | null
          status: string
          study_date: string
          study_plan_id: string
          subject_id: string | null
          task: string
          unit_id: string | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          duration_minutes: number
          id?: string
          priority?: string
          start_time?: string | null
          status?: string
          study_date: string
          study_plan_id: string
          subject_id?: string | null
          task: string
          unit_id?: string | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          priority?: string
          start_time?: string | null
          status?: string
          study_date?: string
          study_plan_id?: string
          subject_id?: string | null
          task?: string
          unit_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_plan_items_study_plan_id_fkey"
            columns: ["study_plan_id"]
            isOneToOne: false
            referencedRelation: "study_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plan_items_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plan_items_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "syllabus_units"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plans: {
        Row: {
          available_minutes_per_day: number | null
          created_at: string
          created_by: string | null
          end_date: string | null
          exam_date: string | null
          id: string
          start_date: string | null
          student_id: string
          subject_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          available_minutes_per_day?: number | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          exam_date?: string | null
          id?: string
          start_date?: string | null
          student_id: string
          subject_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          available_minutes_per_day?: number | null
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          exam_date?: string | null
          id?: string
          start_date?: string | null
          student_id?: string
          subject_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plans_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          code: string
          created_at: string
          credits: number | null
          department_id: string
          description: string | null
          id: string
          name: string
          semester_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          credits?: number | null
          department_id: string
          description?: string | null
          id?: string
          name: string
          semester_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          credits?: number | null
          department_id?: string
          description?: string | null
          id?: string
          name?: string
          semester_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subjects_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
        ]
      }
      syllabus_topics: {
        Row: {
          created_at: string
          description: string | null
          id: string
          sequence_number: number
          title: string
          unit_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          sequence_number: number
          title: string
          unit_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          sequence_number?: number
          title?: string
          unit_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "syllabus_topics_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "syllabus_units"
            referencedColumns: ["id"]
          },
        ]
      }
      syllabus_units: {
        Row: {
          created_at: string
          description: string | null
          id: string
          subject_id: string
          title: string
          unit_number: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          subject_id: string
          title: string
          unit_number: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          subject_id?: string
          title?: string
          unit_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "syllabus_units_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      timetable_entries: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          faculty_id: string | null
          id: string
          room: string | null
          schedule_type: string
          semester_id: string
          start_time: string
          subject_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          faculty_id?: string | null
          id?: string
          room?: string | null
          schedule_type?: string
          semester_id: string
          start_time: string
          subject_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          faculty_id?: string | null
          id?: string
          room?: string | null
          schedule_type?: string
          semester_id?: string
          start_time?: string
          subject_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "timetable_entries_faculty_id_fkey"
            columns: ["faculty_id"]
            isOneToOne: false
            referencedRelation: "faculty"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_semester_id_fkey"
            columns: ["semester_id"]
            isOneToOne: false
            referencedRelation: "semesters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timetable_entries_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      unit_progress: {
        Row: {
          completed: boolean
          id: string
          progress_percentage: number
          student_id: string
          subject_id: string
          unit_number: number
          updated_at: string
        }
        Insert: {
          completed?: boolean
          id?: string
          progress_percentage?: number
          student_id: string
          subject_id: string
          unit_number: number
          updated_at?: string
        }
        Update: {
          completed?: boolean
          id?: string
          progress_percentage?: number
          student_id?: string
          subject_id?: string
          unit_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "unit_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "unit_progress_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_faculty: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

