declare namespace NoteStats {
  type GetDashboardParams = {
    start_date?: string;
    end_date?: string;
    doctorId?: string;
    clinic?: string;
    departmentId?: string;
  };

  type Overview = {
    note_count: number;
    total_recording_duration_ms: number;
    avg_recording_duration_ms: number;
    doctor_count: number;
    department_count: number;
    patient_count: number;
  };

  type TrendItem = {
    stat_date: string;
    note_count: number;
    doctor_count: number;
    department_count: number;
    total_recording_duration_ms: number;
    avg_recording_duration_ms: number;
  };

  type BucketItem = {
    name: string;
    count: number;
    total_recording_duration_ms: number;
    avg_recording_duration_ms: number;
  };

  type SelectorOption = {
    id?: string;
    name?: string;
    label?: string;
    value?: string;
  };

  type DashboardSelectors = {
    doctors: SelectorOption[];
    clinics: SelectorOption[];
    departments: SelectorOption[];
  };

  type Dashboard = {
    overview: Overview;
    daily_trend: TrendItem[];
    by_doctor: BucketItem[];
    by_clinic: BucketItem[];
    by_department: BucketItem[];
    by_patient_gender: BucketItem[];
    by_patient_age_bucket: BucketItem[];
    selectors: DashboardSelectors;
  };
}
