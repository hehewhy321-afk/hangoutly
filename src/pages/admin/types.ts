export interface DashboardStats {
    totalUsers: number;
    totalCompanions: number;
    pendingVerifications: number;
    openComplaints: number;
    activeBookings: number;
    completedBookings: number;
    totalRevenue: number;
    userActivityTrend: number;
}

export interface UserProfile {
    id: string;
    user_id: string;
    first_name: string;
    last_name: string;
    gender: string;
    city: string;
    phone: string;
    avatar_url: string;
    is_identity_verified: boolean;
    is_verified: boolean;
    is_active: boolean;
    is_companion: boolean;
    is_online: boolean;
    created_at: string;
    bookings_count?: number;
    total_spent?: number;
}

export interface Verification {
    id: string;
    full_name: string;
    document_type: string;
    document_front_url: string;
    document_back_url: string;
    selfie_url: string;
    status: string;
    created_at: string;
    profile_id: string;
    reviewer_notes: string | null;
    submitter_country: string | null;
    profile: {
        first_name: string;
        avatar_url: string;
        city: string;
    };
}

export interface Complaint {
    id: string;
    complaint_type: string;
    description: string;
    status: string;
    created_at: string;
    reporter_id: string;
    reported_user_id: string;
}
