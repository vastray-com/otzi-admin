declare namespace Record {
  type GetListParams = PaginationParams & {
    record_id?: string;
    start_date?: string;
    end_date?: string;
  };

  type Item = {
    id: {
      tb: 'note';
      id: {
        String: 'n9zxiexddciyez2uxgdc';
      };
    };
    record_id: '2h58ktav1yq';
    tags: [];
    recording_file: null;
    recording_transcribe: '用户1:头疼\n用户0:三天\n用户0:肚子疼\n用户0:你好\n用户0:吃药了吗\n用户0:所以也没有那么好\n用户0:没有吃药';
    sentences: [
      {
        begin_time: 1710;
        end_time: 2190;
        role_id: '用户1';
        content: '头疼';
        is_sent: true;
        words: [];
      },
      {
        begin_time: 2190;
        end_time: 3230;
        role_id: '用户0';
        content: '三天';
        is_sent: true;
        words: [];
      },
      {
        begin_time: 4080;
        end_time: 5960;
        role_id: '用户0';
        content: '肚子疼';
        is_sent: true;
        words: [];
      },
      {
        begin_time: 17200;
        end_time: 18280;
        role_id: '用户0';
        content: '你好';
        is_sent: true;
        words: [];
      },
      {
        begin_time: 22530;
        end_time: 23810;
        role_id: '用户0';
        content: '吃药了吗';
        is_sent: true;
        words: [];
      },
      {
        begin_time: 24300;
        end_time: 25180;
        role_id: '用户0';
        content: '所以也没有那么好';
        is_sent: true;
        words: [];
      },
      {
        begin_time: 25710;
        end_time: 27190;
        role_id: '用户0';
        content: '没有吃药';
        is_sent: true;
        words: [];
      },
    ];
    medical_record: '{"chief_complaint": "头痛3天", "main_symptom": "头痛", "present_history": "患者3天前出现头痛，伴腹痛，未接受过药物治疗。", "past_history": "", "personal_history": "", "smoking_status": "", "smoking_years": "", "pathological_examination": "", "childbearing_history": "", "marriage_history": "", "menstrual_history": "", "family_history": "", "allergy_history": "", "diagnosis": "1.头痛；2.腹痛；", "plan": "若症状持续或加重，建议3天内复诊；如检查结果异常，需根据医生建议随时复诊。", "advice": "密切观察症状变化，若头痛或腹痛加重，或出现其他异常症状（如呕吐、发热等），需立即就医。", "medication_treatment_advice": "根据检查结果决定是否需要药物治疗。如果头痛与腹痛相关，可考虑使用止痛药（如对乙酰氨基酚）缓解症状，但需在医生指导下使用。", "examination_advice": "建议进行血常规、尿常规、腹部超声检查以及头颅CT或MRI检查，以明确头痛和腹痛的原因。", "physique": "神志清，双侧瞳孔等大等圆，对光反射灵敏，颈软，无抵抗，腹平软，未见明显压痛及反跳痛，肝脾肋下未及，肠鸣音正常。"}';
    channels: 1;
    created_at: '2025-07-02T11:35:18.020066+08:00';
  };

  type List = Item[];
}
