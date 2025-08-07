declare namespace Record {
  type ListFilter = {
    record_id?: string;
    start_date?: string;
    end_date?: string;
  };
  type GetListParams = PaginationParams & ListFilter;

  type Item = {
    id: {
      tb: string;
      id: {
        String: string;
      };
    };
    record_id: string;
    tags: string[];
    recording_file: string | null;
    recording_transcribe: string | null;
    sentences: {
      begin_time: number;
      end_time: number;
      role_id: '医生' | '患者';
      content: string;
      is_sent: boolean;
      words: string[];
    }[];
    medical_record: string;
    channels: 1 | 2;
    created_at: string;
  };

  type List = Item[];
}
