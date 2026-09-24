import {
  ApartmentOutlined,
  AudioOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Line } from '@ant-design/plots';
import {
  App,
  Button,
  Card,
  DatePicker,
  Form,
  type GetProps,
  Segmented,
  Select,
  Statistic,
} from 'antd';
import dayjs from 'dayjs';
import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { ContentLayout } from '@/components/ContentLayout';
import { useApi } from '@/hooks/useApi';
import type { Dayjs } from 'dayjs';

type FilterValues = {
  range?: [Dayjs, Dayjs];
  doctorId?: string;
  clinic?: string;
  departmentId?: string;
};

type BucketMetric = 'count' | 'duration';
type BucketChartKey = 'doctor' | 'department' | 'clinic';

type LinePoint = {
  statDate: string;
  value: number;
};

const emptyDashboard: NoteStats.Dashboard = {
  overview: {
    note_count: 0,
    total_recording_duration_ms: 0,
    avg_recording_duration_ms: 0,
    doctor_count: 0,
    department_count: 0,
    patient_count: 0,
  },
  daily_trend: [],
  by_doctor: [],
  by_clinic: [],
  by_department: [],
  by_patient_gender: [],
  by_patient_age_bucket: [],
  selectors: {
    doctors: [],
    clinics: [],
    departments: [],
  },
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

const toFilterValue = (value?: string) => {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
};

const toQueryParams = (values: FilterValues): NoteStats.GetDashboardParams => {
  const params: NoteStats.GetDashboardParams = {};
  if (values.range?.length === 2) {
    params.start_date = values.range[0].format('YYYY-MM-DD');
    params.end_date = values.range[1].format('YYYY-MM-DD');
  }
  params.doctorId = toFilterValue(values.doctorId);
  params.clinic = toFilterValue(values.clinic);
  params.departmentId = toFilterValue(values.departmentId);
  return params;
};

const toSelectOptions = (options: NoteStats.SelectorOption[]) =>
  options
    .map((item) => {
      const value = (
        item.value ??
        item.id ??
        item.name ??
        item.label ??
        ''
      ).trim();
      const label = (
        item.label ??
        item.name ??
        item.value ??
        item.id ??
        ''
      ).trim();
      return { value, label: label || value };
    })
    .filter((item) => item.value);

const MissingData = ({ text }: { text: string }) => (
  <div className="h-[220px] rounded-[8px] bg-[#fafafa] border border-[#f0f0f0] px-[12px] py-[10px] text-[13px] text-[#999]">
    {text}
  </div>
);

const hexToRgb = (hex: string) => {
  const normalized = hex.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((char) => `${char}${char}`)
          .join('')
      : normalized;
  const int = Number.parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

const getOverviewColors = (accentColor: string) => {
  const { r, g, b } = hexToRgb(accentColor);
  return {
    borderColor: `rgba(${r}, ${g}, ${b}, 0.4)`,
    cardBgColor: `rgba(${r}, ${g}, ${b}, 0.08)`,
    iconBgColor: `rgba(${r}, ${g}, ${b}, 0.16)`,
    valueColor: `rgb(${Math.round(r * 0.35)}, ${Math.round(g * 0.35)}, ${Math.round(b * 0.35)})`,
  };
};

const OverviewStatCard = ({
  title,
  value,
  accentColor,
  icon,
}: {
  title: string;
  value: number;
  accentColor: string;
  icon: ReactNode;
}) => {
  const { borderColor, cardBgColor, iconBgColor, valueColor } =
    getOverviewColors(accentColor);
  return (
    <div className="bg-white rounded-[8px]">
      <Card
        size="small"
        style={{
          height: '100%',
          borderColor,
          borderWidth: 1.25,
          backgroundColor: cardBgColor,
        }}
        styles={{ body: { padding: 14 } }}
      >
        <div className="flex items-center justify-between">
          <Statistic
            title={title}
            value={value}
            valueStyle={{ color: valueColor, fontSize: 22, fontWeight: 600 }}
          />
          <div
            className="h-[36px] w-[36px] rounded-full flex items-center justify-center text-[18px]"
            style={{ color: accentColor, backgroundColor: iconBgColor }}
          >
            {icon}
          </div>
        </div>
      </Card>
    </div>
  );
};

const OverviewDurationCard = ({
  title,
  durationMs,
  accentColor,
  icon,
}: {
  title: string;
  durationMs: number;
  accentColor: string;
  icon: ReactNode;
}) => {
  const { borderColor, cardBgColor, iconBgColor, valueColor } =
    getOverviewColors(accentColor);
  return (
    <div className="bg-white rounded-[8px]">
      <Card
        size="small"
        style={{
          borderColor,
          borderWidth: 1.25,
          backgroundColor: cardBgColor,
        }}
        styles={{ body: { padding: 14 } }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[14px] text-[#666]">{title}</div>
            <div
              className="mt-[4px] text-[20px] font-semibold"
              style={{ color: valueColor }}
            >
              {formatDurationMs(Math.round(durationMs))}
            </div>
            <div className="text-[12px] text-[#999]">
              {Math.round(durationMs).toLocaleString()} ms
            </div>
          </div>
          <div
            className="h-[36px] w-[36px] rounded-full flex items-center justify-center text-[18px]"
            style={{ color: accentColor, backgroundColor: iconBgColor }}
          >
            {icon}
          </div>
        </div>
      </Card>
    </div>
  );
};

const LineChart = ({
  points,
  seriesName,
  lineColor,
  formatValue,
}: {
  points: LinePoint[];
  seriesName: string;
  lineColor: string;
  formatValue?: (value: number) => string;
}) => {
  if (points.length === 0) {
    return <MissingData text="暂无趋势数据" />;
  }

  const data = points.map((point) => ({
    statDate: point.statDate,
    value: Math.round(point.value),
  }));
  const valueFormatter =
    formatValue ?? ((value: number) => Math.round(value).toLocaleString());
  const values = data.map((item) => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const buildIntegerTicks = (min: number, max: number) => {
    if (min === max) {
      if (max <= 1) return [0, 1];
      return [0, max];
    }
    const range = max - min;
    if (range <= 5) {
      return Array.from({ length: range + 1 }, (_, i) => min + i);
    }
    const step = Math.max(1, Math.ceil(range / 4));
    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;
    const ticks: number[] = [];
    for (let value = start; value <= end; value += step) {
      ticks.push(value);
    }
    return ticks;
  };
  const yTicks = buildIntegerTicks(minValue, maxValue);
  const yScale = {
    nice: false,
    domainMin: yTicks[0],
    domainMax: yTicks[yTicks.length - 1],
    tickCount: yTicks.length,
  };

  return (
    <Line
      data={data}
      xField="statDate"
      yField="value"
      height={220}
      line={{ style: { lineWidth: 3, stroke: lineColor } }}
      point={{
        size: 4,
        shape: 'circle',
        style: { fill: lineColor, stroke: '#fff', lineWidth: 1.2 },
      }}
      axis={{
        x: {
          labelFormatter: (value: string) => value.slice(5),
        },
        y: {
          tickCount: yTicks.length,
          tickMethod: () => yTicks,
          labelFormatter: (value: string) => Number(value).toLocaleString(),
        },
      }}
      tooltip={{
        title: 'statDate',
        items: [
          {
            channel: 'y',
            name: seriesName,
            valueFormatter: (value: number | string) =>
              valueFormatter(Number(value)),
          },
        ],
      }}
      scale={{
        y: yScale,
      }}
    />
  );
};

const HorizontalBarChart = ({
  items,
  metric,
  barColor,
}: {
  items: NoteStats.BucketItem[];
  metric: BucketMetric;
  barColor: string;
}) => {
  if (items.length === 0) {
    return <MissingData text="暂无分布数据" />;
  }

  const topItems = items.slice(0, 10);
  const getValue = (item: NoteStats.BucketItem) =>
    metric === 'count' ? item.count : item.total_recording_duration_ms;
  const max = Math.max(...topItems.map((item) => getValue(item)), 0);
  const denominator = max <= 0 ? 1 : max;
  const formatValue = (value: number) =>
    metric === 'count'
      ? `${value.toLocaleString()} 份`
      : `${formatDurationMs(value)} (${value.toLocaleString()} ms)`;

  return (
    <div className="space-y-[10px]">
      {topItems.map((item) => {
        const value = getValue(item);
        return (
          <div
            key={item.name}
            className="grid grid-cols-[140px_1fr_180px] gap-[8px] items-center"
          >
            <div className="truncate text-[13px] text-[#333]" title={item.name}>
              {item.name || '未知'}
            </div>
            <div className="h-[10px] rounded-[5px] bg-[#f0f0f0]">
              <div
                className="h-full rounded-[5px]"
                style={{
                  backgroundColor: barColor,
                  width: `${Math.max((value / denominator) * 100, 2)}%`,
                }}
              />
            </div>
            <div className="text-right text-[12px] text-[#333]">
              {formatValue(value)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DataDashboardPage = () => {
  const { message } = App.useApp();
  const { recordApi } = useApi();
  const [form] = Form.useForm<FilterValues>();
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [stats, setStats] = useState<NoteStats.Dashboard>(emptyDashboard);
  const [bucketMetrics, setBucketMetrics] = useState<
    Record<BucketChartKey, BucketMetric>
  >({
    doctor: 'count',
    department: 'count',
    clinic: 'count',
  });
  const defaultRange = useMemo<[Dayjs, Dayjs]>(
    () => [dayjs().add(-1, 'month').startOf('day'), dayjs().endOf('day')],
    [],
  );

  const fetchStats = useCallback(
    async (params: NoteStats.GetDashboardParams) => {
      setLoading(true);
      try {
        const res = await recordApi.getNoteDashboardStats(params);
        if (res.code !== 200) {
          message.error(res.msg || '获取看板统计失败，请稍后再试');
          return;
        }
        setStats(res.data ?? emptyDashboard);
      } finally {
        setLoading(false);
      }
    },
    [message, recordApi],
  );

  useEffect(() => {
    fetchStats(toQueryParams({ range: defaultRange })).catch(() => {
      message.error('获取看板统计失败，请稍后再试');
    });
  }, [defaultRange, fetchStats, message]);

  const onFinish = useCallback(
    async (values: FilterValues) => {
      await fetchStats(toQueryParams(values));
    },
    [fetchStats],
  );

  const resetFilters = useCallback(() => {
    form.resetFields();
    const values: FilterValues = { range: defaultRange };
    form.setFieldsValue(values);
    fetchStats(toQueryParams(values)).catch(() => {
      message.error('获取看板统计失败，请稍后再试');
    });
  }, [defaultRange, fetchStats, form, message]);

  const onExport = useCallback(async () => {
    const params = toQueryParams(form.getFieldsValue());
    setExporting(true);
    try {
      const blob = await recordApi.exportNoteDashboardStatsZip(params);
      const downloadUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = `数据看板_${dayjs().format('YYYYMMDD_HHmmss')}.zip`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(downloadUrl);
      message.success('导出成功');
    } catch {
      message.error('导出失败，请稍后再试');
    } finally {
      setExporting(false);
    }
  }, [form, message, recordApi]);

  const disabledDate: GetProps<typeof DatePicker.RangePicker>['disabledDate'] =
    (current) => {
      if (!current) return false;
      const todayEnd = dayjs().endOf('day');
      return current > todayEnd || current < todayEnd.add(-12, 'month');
    };

  const doctorOptions = useMemo(
    () => toSelectOptions(stats.selectors.doctors),
    [stats.selectors.doctors],
  );
  const clinicOptions = useMemo(
    () => toSelectOptions(stats.selectors.clinics),
    [stats.selectors.clinics],
  );
  const departmentOptions = useMemo(
    () => toSelectOptions(stats.selectors.departments),
    [stats.selectors.departments],
  );

  const noteCountTrend = useMemo<LinePoint[]>(
    () =>
      stats.daily_trend.map((item) => ({
        statDate: item.stat_date,
        value: item.note_count,
      })),
    [stats.daily_trend],
  );
  const doctorCountTrend = useMemo<LinePoint[]>(
    () =>
      stats.daily_trend.map((item) => ({
        statDate: item.stat_date,
        value: item.doctor_count,
      })),
    [stats.daily_trend],
  );
  const departmentCountTrend = useMemo<LinePoint[]>(
    () =>
      stats.daily_trend.map((item) => ({
        statDate: item.stat_date,
        value: item.department_count,
      })),
    [stats.daily_trend],
  );
  const totalDurationTrend = useMemo<LinePoint[]>(
    () =>
      stats.daily_trend.map((item) => ({
        statDate: item.stat_date,
        value: item.total_recording_duration_ms,
      })),
    [stats.daily_trend],
  );
  const avgDurationTrend = useMemo<LinePoint[]>(
    () =>
      stats.daily_trend.map((item) => ({
        statDate: item.stat_date,
        value: item.avg_recording_duration_ms,
      })),
    [stats.daily_trend],
  );

  return (
    <ContentLayout title="数据看板">
      <Card>
        <Form<FilterValues>
          form={form}
          layout="inline"
          onFinish={onFinish}
          initialValues={{ range: defaultRange }}
        >
          <div className="flex flex-wrap gap-[12px]">
            <Form.Item
              label="统计日期"
              name="range"
              style={{ width: 340, marginBottom: 0 }}
            >
              <DatePicker.RangePicker
                className="w-full"
                disabledDate={disabledDate}
              />
            </Form.Item>
            <Form.Item
              label="科室"
              name="departmentId"
              style={{ width: 240, marginBottom: 0 }}
            >
              <Select
                allowClear
                placeholder="请选择科室"
                options={departmentOptions}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
            <Form.Item
              label="医生"
              name="doctorId"
              style={{ width: 200, marginBottom: 0 }}
            >
              <Select
                allowClear
                placeholder="请选择医生"
                options={doctorOptions}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
            <Form.Item
              label="诊室"
              name="clinic"
              style={{ width: 200, marginBottom: 0 }}
            >
              <Select
                allowClear
                placeholder="请选择诊室"
                options={clinicOptions}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </div>
          <div className="flex justify-end gap-[8px]">
            <Button onClick={resetFilters}>重置</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              查询
            </Button>
            <Button onClick={() => void onExport()} loading={exporting}>
              导出
            </Button>
          </div>
        </Form>
      </Card>

      <div className="mt-[16px] grid grid-cols-3 gap-[12px]">
        <OverviewStatCard
          title="病历总数"
          value={stats.overview.note_count}
          accentColor="#1677ff"
          icon={<FileTextOutlined />}
        />
        <OverviewStatCard
          title="使用医生数"
          value={stats.overview.doctor_count}
          accentColor="#13c2c2"
          icon={<UserOutlined />}
        />
        <OverviewStatCard
          title="使用科室数"
          value={stats.overview.department_count}
          accentColor="#722ed1"
          icon={<ApartmentOutlined />}
        />
        <OverviewStatCard
          title="患者人数"
          value={stats.overview.patient_count}
          accentColor="#fa8c16"
          icon={<TeamOutlined />}
        />
        <OverviewDurationCard
          title="总录音时长"
          durationMs={stats.overview.total_recording_duration_ms}
          accentColor="#52c41a"
          icon={<AudioOutlined />}
        />
        <OverviewDurationCard
          title="单份平均录音时长"
          durationMs={stats.overview.avg_recording_duration_ms}
          accentColor="#eb2f96"
          icon={<ClockCircleOutlined />}
        />
      </div>

      <div className="mt-[16px] grid grid-cols-2 gap-[12px]">
        <Card title="每日病历总数">
          <LineChart
            points={noteCountTrend}
            seriesName="病历总数"
            lineColor="#1677ff"
          />
        </Card>
        <Card title="每日使用医生数">
          <LineChart
            points={doctorCountTrend}
            seriesName="使用医生数"
            lineColor="#13c2c2"
          />
        </Card>
        <Card title="每日使用科室数">
          <LineChart
            points={departmentCountTrend}
            seriesName="使用科室数"
            lineColor="#722ed1"
          />
        </Card>
        <Card
          title="科室使用 Top 10"
          extra={
            <Segmented<BucketMetric>
              size="small"
              value={bucketMetrics.department}
              onChange={(value) =>
                setBucketMetrics((prev) => ({ ...prev, department: value }))
              }
              options={[
                { label: '份数', value: 'count' },
                { label: '录音时长', value: 'duration' },
              ]}
            />
          }
        >
          <HorizontalBarChart
            items={stats.by_department}
            metric={bucketMetrics.department}
            barColor="#722ed1"
          />
        </Card>
        <Card
          title="医生使用 Top 10"
          extra={
            <Segmented<BucketMetric>
              size="small"
              value={bucketMetrics.doctor}
              onChange={(value) =>
                setBucketMetrics((prev) => ({ ...prev, doctor: value }))
              }
              options={[
                { label: '份数', value: 'count' },
                { label: '录音时长', value: 'duration' },
              ]}
            />
          }
        >
          <HorizontalBarChart
            items={stats.by_doctor}
            metric={bucketMetrics.doctor}
            barColor="#1677ff"
          />
        </Card>
        <Card
          title="诊室使用 Top 10"
          extra={
            <Segmented<BucketMetric>
              size="small"
              value={bucketMetrics.clinic}
              onChange={(value) =>
                setBucketMetrics((prev) => ({ ...prev, clinic: value }))
              }
              options={[
                { label: '份数', value: 'count' },
                { label: '录音时长', value: 'duration' },
              ]}
            />
          }
        >
          <HorizontalBarChart
            items={stats.by_clinic}
            metric={bucketMetrics.clinic}
            barColor="#13c2c2"
          />
        </Card>
        <Card title="每日总录音时长">
          <LineChart
            points={totalDurationTrend}
            seriesName="总录音时长"
            lineColor="#52c41a"
            formatValue={(value) => formatDurationMs(Math.round(value))}
          />
        </Card>
        <Card title="每日平均单份录音时长">
          <LineChart
            points={avgDurationTrend}
            seriesName="平均单份录音时长"
            lineColor="#eb2f96"
            formatValue={(value) => formatDurationMs(Math.round(value))}
          />
        </Card>
      </div>
    </ContentLayout>
  );
};

export default DataDashboardPage;
