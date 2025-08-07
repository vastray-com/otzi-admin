import { Divider, Empty, Pagination, Typography } from 'antd';
import clsx from 'clsx';
import dayjs from 'dayjs';
import { formatSecondsToTime, parseAIInsightContent } from '@/utils/helper';
import type { FC } from 'react';

type ListProps = {
  list: Record.List;
  selectedId?: string | null;
  onSelectChange: (item: Record.Item) => void;
  pagination: PaginationParams;
  onPaginationChange: (pagination: PaginationParams) => void;
  total?: number;
};
const RecordList: FC<ListProps> = ({
  list,
  selectedId,
  onSelectChange,
  pagination,
  onPaginationChange,
  total,
}) => {
  if (!list || list.length === 0) {
    return <Empty description="暂无病历记录" />;
  }

  return (
    <div>
      <ul>
        {list.map((item) => (
          <li
            key={item.record_id}
            className={clsx(
              selectedId === item.record_id
                ? 'bg-[#e6f7ff]'
                : 'hover:bg-[#f4f4f4]',
              'text-[16px] rounded-[6px] px-[12px] py-[6px] mt-[8px] first:mt-0 cursor-pointer ',
            )}
            onClick={() => onSelectChange(item)}
          >
            <Typography.Text ellipsis className="fg-primary">
              {`病案号：${item.record_id}`}
            </Typography.Text>
            <p
              className={clsx(
                selectedId === item.record_id ? 'fg-primary' : 'fg-tertiary',
                'text-[14px] mt-[4px]',
              )}
            >
              {dayjs(item.created_at).format('YYYY/MM/DD HH:mm:ss')}
            </p>
          </li>
        ))}
      </ul>

      <Divider />

      <div className="w-[calc(100%_-_48px)] mx-auto">
        <Pagination
          simple
          align="center"
          showSizeChanger={false}
          className="mt-[24px]"
          current={pagination.page}
          pageSize={pagination.page_size}
          onChange={(page, page_size) =>
            onPaginationChange({ page_size, page })
          }
          total={total}
        />
      </div>
    </div>
  );
};

const RecordMessage: FC<{ data?: Record.Item | null }> = ({ data }) => {
  if (!data) return <Empty image={null} description="当前未选中病历" />;
  return (
    <div>
      <ul>
        {data.sentences.map(
          (sentence) =>
            sentence.content && (
              <li
                key={sentence.begin_time + sentence.role_id}
                className="mb-[20px] flex items-start gap-x-[12px]"
              >
                <div>
                  {sentence.role_id === '医生' ? (
                    <img
                      src="/doctor.svg"
                      alt=""
                      className="h-full aspect-ratio-square"
                    />
                  ) : (
                    <img
                      src="/patient.svg"
                      alt=""
                      className="h-full aspect-ratio-square"
                    />
                  )}
                </div>
                <div>
                  <p>
                    <span className="fg-primary">{sentence.role_id}</span>
                    <span className="ml-[12px] fg-tertiary">
                      {formatSecondsToTime(sentence.begin_time)}
                    </span>
                  </p>
                  <p className="inline-block text-[16px] fg-primary p-[12px] bg-[#f6f6f6] rounded-[8px] mt-[4px]">
                    {sentence.content}
                  </p>
                </div>
              </li>
            ),
        )}
      </ul>
    </div>
  );
};

const medicalRecordItems = [
  { key: 'chief_complaint', label: '主诉' },
  { key: 'present_history', label: '现病史' },
  { key: 'past_history', label: '既往史' },
  { key: 'allergy_history', label: '过敏史' },
  { key: 'personal_history', label: '个人史' },
  { key: 'family_history', label: '家族史' },
  { key: 'childbearing_history', label: '生育史' },
  { key: 'marriage_history', label: '婚姻史' },
  { key: 'menstrual_history', label: '月经史' },
  { key: 'physique', label: '体格检查' },
  { key: 'diagnosis', label: '辅助诊断' },
  { key: 'plan', label: '复诊计划初步诊断' },
  { key: 'examination_advice', label: '辅助检查' },
  { key: 'advice', label: '注意事项' },
  { key: 'medication_treatment_advice', label: '用药或治疗' },
  { key: 'diet_exercise_advice', label: '饮食与运动' },
];

const RecordGenerationResult: FC<{ data?: Record.Item | null }> = ({
  data,
}) => {
  if (!data) return <Empty image={null} description="当前未选中病历" />;

  // 解析病历内容
  const content = parseAIInsightContent(data.medical_record);

  return (
    <div className="h-full w-full flex flex-col gap-y-[24px] overflow-auto py-[12px]">
      {medicalRecordItems.map((item) =>
        ['生育史', '婚姻史', '月经史'].includes(item.label) &&
        !content?.[item.key] ? null : (
          <div key={item.key}>
            <h2 className="text-[16px] text-[#009FFD] font-medium">
              {item.label}
            </h2>
            <p className="whitespace-pre-wrap text-[14px] text-primary mt-[4px]">
              {content?.[item.key]}
            </p>
          </div>
        ),
      )}
    </div>
  );
};

export const RecordListPageCom = {
  RecordList,
  RecordMessage,
  RecordGenerationResult,
};
