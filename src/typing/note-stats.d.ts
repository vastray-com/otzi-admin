declare namespace NoteStats {
  type GetListParams = {
    start_date?: string;
    end_date?: string;
  };

  type Thing = {
    tb: string;
    id: {
      String: string;
    };
  };

  type Item = {
    id?: Thing;
    stat_date: string;
    note_count: number;
    total_recording_duration_ms: number;
    avg_recording_duration_ms: number;
    created_at?: string;
    updated_at?: string;
  };

  type List = Item[];
}
