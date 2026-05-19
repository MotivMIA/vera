import type { DocumentState, InternalDocumentType, OnboardingStep, VerificationState } from "@/types/onboarding";

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_user_id: string;
          email: string | null;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["users"]["Row"]> & { clerk_user_id: string };
        Update: Partial<Database["public"]["Tables"]["users"]["Row"]>;
      };
      onboarding_status: {
        Row: {
          id: string;
          clerk_user_id: string;
          current_step: OnboardingStep;
          terms_accepted_at: string | null;
          privacy_accepted_at: string | null;
          esign_accepted_at: string | null;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["onboarding_status"]["Row"]> & { clerk_user_id: string };
        Update: Partial<Database["public"]["Tables"]["onboarding_status"]["Row"]>;
      };
      verification_status: {
        Row: {
          id: string;
          clerk_user_id: string;
          provider: "didit";
          provider_session_id: string | null;
          status: VerificationState;
          metadata_encrypted: string | null;
          last_checked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["verification_status"]["Row"]> & { clerk_user_id: string };
        Update: Partial<Database["public"]["Tables"]["verification_status"]["Row"]>;
      };
      signed_documents: {
        Row: {
          id: string;
          clerk_user_id: string;
          document_type: InternalDocumentType;
          provider: "internal" | "jotform";
          provider_document_id: string | null;
          status: DocumentState;
          signed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["signed_documents"]["Row"]> & { clerk_user_id: string };
        Update: Partial<Database["public"]["Tables"]["signed_documents"]["Row"]>;
      };
      audit_logs: {
        Row: {
          id: string;
          clerk_user_id: string | null;
          action: string;
          ip_hash: string | null;
          user_agent: string | null;
          metadata_encrypted: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["audit_logs"]["Row"]> & { action: string };
        Update: never;
      };
    };
  };
};
