import { App, Button, Card, DatePicker, Form, Table } from 'antd';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { ContentLayout } from '@/components/ContentLayout';
import { useApi } from '@/hooks/useApi';
import type { Dayjs } from 'dayjs';

type FilterValues = {
  range?: [Dayjs, Dayjs];
};

const formatDurationMs = (durationMs: number) => {
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const getParamsByRange = (range?: [Dayjs, Dayjs]): NoteStats.GetListParams => {
  if (range?.length !== 2) return {};
  return {
    start_date: range[0].format('YYYY-MM-DD'),
    end_date: range[1].format('YYYY-MM-DD'),
  };
};

const DataDashboardPage = () => {
  const { message } = App.useApp();
  const { recordApi } = useApi();
  const [form] = Form.useForm<FilterValues>();
  const defaultRange = useMemo<[Dayjs, Dayjs]>(
    () => [dayjs().add(-1, 'month').startOf('day'), dayjs().endOf('day')],
    [],
  );
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<NoteStats.List>([]);

  const fetchStats = useCallback(
    async (params: NoteStats.GetListParams) => {
      setLoading(true);
      try {
        const res = await recordApi.getNoteStats(params);
        if (res.code !== 200) {
          message.error(res.msg || '获取统计数据失败，请稍后再试');
          return;
        }
        setData(res.data);
      } finally {
        setLoading(false);
      }
    },
    [message, recordApi],
  );

  useEffect(() => {
    fetchStats(getParamsByRange(defaultRange)).catch(() => {
      message.error('获取统计数据失败，请稍后再试');
    });
  }, [defaultRange, fetchStats, message]);

  const onFinish = useCallback(
    async (values: FilterValues) => {
      await fetchStats(getParamsByRange(values.range));
    },
    [fetchStats],
  );

  const columns = useMemo(
    () => [
      {
        title: '统计日期',
        dataIndex: 'stat_date',
        key: 'stat_date',
      },
      {
        title: '病历数量',
        dataIndex: 'note_count',
        key: 'note_count',
      },
      {
        title: '总录音时长',
        dataIndex: 'total_recording_duration_ms',
        key: 'total_recording_duration_ms',
        render: (value: number) => `${formatDurationMs(value)} (${value} ms)`,
      },
      {
        title: '平均录音时长',
        dataIndex: 'avg_recording_duration_ms',
        key: 'avg_recording_duration_ms',
        render: (value: number) =>
          `${formatDurationMs(Math.floor(value))} (${value.toFixed(0)} ms)`,
      },
    ],
    [],
  );

  return (
    <ContentLayout title="数据看板">
      <Card className="h-[80px]">
        <Form<FilterValues>
          form={form}
          layout="inline"
          className="h-full flex items-center justify-between"
          onFinish={onFinish}
          initialValues={{ range: defaultRange }}
        >
          <Form.Item label="统计日期" name="range">
            <DatePicker.RangePicker />
          </Form.Item>
          <div className="flex items-center gap-x-[8px]">
            <Button
              onClick={() => {
                form.resetFields();
                fetchStats(getParamsByRange(defaultRange)).catch(() => {
                  message.error('获取统计数据失败，请稍后再试');
                });
              }}
            >
              重置
            </Button>
            <Form.Item noStyle>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Card>

      <Card
        className="mt-[16px] h-[calc(100%_-_80px_-_16px)]"
        bodyStyle={{ padding: 0 }}
      >
        <Table<NoteStats.Item>
          rowKey={(item) => item.id?.id.String ?? item.stat_date}
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          scroll={{ y: 'calc(100vh - 280px)' }}
        />
      </Card>
    </ContentLayout>
  );
};

export default DataDashboardPage;
