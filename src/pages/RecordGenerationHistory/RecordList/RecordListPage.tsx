import {
  Button,
  Card,
  DatePicker,
  Divider,
  Form,
  type FormProps,
  type GetProps,
  Input,
  Tabs,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useCallback, useRef, useState } from 'react';
import { ContentLayout } from '@/components/ContentLayout';
import { useApi } from '@/hooks/useApi';
import { RecordListPageCom } from '@/pages/RecordGenerationHistory/RecordList/components';

type Filter = {
  record_id?: string | null;
  range?: [Dayjs, Dayjs] | null;
};
const initialFilter: Filter = {
  record_id: null,
  range: null,
};
const initialPagination = {
  page: 1,
  page_size: 10,
};

const getCaptionTrackSource = (recordingTranscribe?: string | null) => {
  const content = recordingTranscribe?.trim() ?? '';
  const vtt = content
    ? `WEBVTT\n\n00:00:00.000 --> 99:59:59.000\n${content}\n`
    : 'WEBVTT\n\n';
  return `data:text/vtt;charset=utf-8,${encodeURIComponent(vtt)}`;
};

const getApiHostOrigin = () => {
  const apiUrl = import.meta.env.VITE_API_URL?.trim();
  if (typeof window === 'undefined') return '';
  if (!apiUrl) return window.location.origin;

  if (!/^https?:\/\//i.test(apiUrl)) return window.location.origin;

  try {
    return new URL(apiUrl).origin;
  } catch {
    return window.location.origin;
  }
};

const withConfiguredHost = (path?: string | null) => {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  if (typeof window === 'undefined') return path;

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getApiHostOrigin()}${normalizedPath}`;
};

const RecordListPage = () => {
  const { recordApi } = useApi();

  const isInitial = useRef(true);

  const [pagination, setPagination] =
    useState<PaginationParams>(initialPagination);
  const [total, setTotal] = useState(0);

  const [data, setData] = useState<Record.List>([]);
  const [current, setCurrent] = useState<Record.Item | null>(null);
  const [activeKey, setActiveKey] = useState<string>('result');
  const firstRecordingFile = withConfiguredHost(
    current?.recording_file?.[0] ?? null,
  );

  // 上次查询的过滤条件，用来 diff，没有变化时不重新拉取数据
  const lastFilter = useRef<Filter>(initialFilter);

  // 拉取病历模板列表
  const fetchList = useCallback(
    async (params: Record.GetListParams) => {
      recordApi
        .getRecordList(params)
        .then((res) => {
          if (res.code === 200) {
            setData(res.data.data);
            setTotal(res.data.total);
            setPagination({
              page: res.data.page,
              page_size: res.data.page_size,
            });

            // 如果当前列表为空，则清空 current
            if (res.data.data.length === 0) {
              setCurrent(null);
              return;
            }

            // 如果当前列表不为空
            // 如果 current 为空，则默认选中第一个
            if (!current) {
              setCurrent(res.data.data[0]);
              return;
            } else {
              // 如果 current 不为空，检查是否在新列表中
              const isCurrentInList = res.data.data.some(
                (item) => item.record_id === current.record_id,
              );
              if (!isCurrentInList) {
                // 如果不在新列表中，则默认选中第一个
                setCurrent(res.data.data[0]);
              }
            }
          }
        })
        .catch((err) => {
          console.error('获取列表失败：', err);
        });
    },
    [recordApi.getRecordList, current],
  );

  // 将条件转换并拉取数据
  const fetchListWithFilter = useCallback(
    async (filter: Filter, pagination: PaginationParams) => {
      const { record_id, range } = filter;
      const params: Record.GetListParams = { ...pagination };
      if (record_id) params.record_id = record_id;
      if (range && range.length === 2) {
        params.start_date = range[0].toISOString();
        params.end_date = range[1].toISOString();
      }
      await fetchList(params);
      setPagination({ ...pagination });
      lastFilter.current = filter;
    },
    [fetchList],
  );

  // 翻页
  const onPaginationChange = useCallback(
    async (new_pagination: PaginationParams) => {
      // 如果翻页没有变化，则不重新拉取数据
      if (
        pagination.page === new_pagination.page &&
        pagination.page_size === new_pagination.page_size
      ) {
        return;
      }

      await fetchListWithFilter(lastFilter.current, new_pagination);
      setPagination(new_pagination);
    },
    [fetchListWithFilter, pagination],
  );

  // 查询表单提交
  const onFinish: FormProps<Filter>['onFinish'] = useCallback(
    async (values: Filter) => {
      // 如果查询条件没有变化，则不重新拉取数据
      if (
        lastFilter.current.record_id === values.record_id &&
        lastFilter.current.range?.length === values.range?.length &&
        (values.range?.length !== 2 ||
          (lastFilter.current.range?.[0].isSame(values.range[0]) &&
            lastFilter.current.range?.[1].isSame(values.range[1])))
      ) {
        return;
      }
      await fetchListWithFilter(values, pagination);
    },
    [pagination, fetchListWithFilter],
  );

  // 禁止选择超过今天的日期和 12 个月前的日期
  const disabledDate: GetProps<typeof DatePicker.RangePicker>['disabledDate'] =
    (current) => {
      if (!current) return false;
      const todayEnd = dayjs().endOf('day');
      return current > todayEnd || current < todayEnd.add(-12, 'month');
    };

  // 如果是第一次加载，返回 null，避免重复渲染
  if (isInitial.current) {
    fetchList(pagination);
    isInitial.current = false; // 设置为 false，避免重复加载
    return null;
  }

  return (
    <ContentLayout title="病历记录">
      <Card className="h-[80px]">
        <Form<Filter>
          layout="inline"
          name="record-search"
          className="flex items-center justify-between"
          onFinish={onFinish}
          initialValues={{ ...initialFilter }}
        >
          <div className="flex items-center gap-[16px]">
            <Form.Item label="病案号" name="record_id">
              <Input />
            </Form.Item>
            <Form.Item label="生成时间" name="range">
              <DatePicker.RangePicker disabledDate={disabledDate} />
            </Form.Item>
          </div>

          <div>
            <Form.Item noStyle>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Card>

      <div className="flex item-center gap-x-[16px] mt-[16px] overflow-auto w-full h-[calc(100%_-_80px_-_16px)]">
        <div className="p-[12px] bg-white rounded-lg shrink-0 grow-0 w-[280px] h-full overflow-auto">
          <RecordListPageCom.RecordList
            list={data}
            selectedId={current?.id.id.String}
            onSelectChange={(c) => {
              setCurrent(c);
              setActiveKey('result');
            }}
            pagination={pagination}
            onPaginationChange={onPaginationChange}
            total={total}
          />
        </div>
        <div className="p-[12px] bg-white rounded-lg flex-1 h-full">
          <h2 className="text-[18px] font-medium">录音记录</h2>
          <div className="mt-[12px] p-[12px] rounded-[8px] bg-[#f8f8f8]">
            <p className="text-[14px] fg-tertiary mb-[8px]">原始音频</p>
            {firstRecordingFile ? (
              <audio controls src={firstRecordingFile} className="w-full">
                <track
                  default
                  kind="captions"
                  src={getCaptionTrackSource(current?.recording_transcribe)}
                  srcLang="zh"
                  label="自动字幕"
                />
                您的浏览器不支持音频播放
              </audio>
            ) : (
              <p className="text-[14px] fg-tertiary">暂无原始音频</p>
            )}
          </div>
          <Divider style={{ marginTop: 12, marginBottom: 12 }} />
          <div className="h-[calc(100%_-_64px)] overflow-auto">
            <RecordListPageCom.RecordMessage data={current} />
          </div>
        </div>
        <div className="px-[12px] bg-white rounded-lg flex-1 h-full overflow-auto">
          <Tabs
            activeKey={activeKey}
            onChange={setActiveKey}
            tabBarStyle={{
              position: 'sticky',
              top: 0,
              background: '#fff',
              padding: '8px 0 0 0',
              zIndex: '100',
            }}
            items={[
              {
                key: 'result',
                label: '生成病历',
                children: (
                  <RecordListPageCom.RecordGenerationResult data={current} />
                ),
              },
              {
                disabled: !current?.revised_mr,
                key: 'revised_mr',
                label: '修改后病历',
                children: (
                  <p className="whitespace-pre-wrap leading-loose">
                    {current?.revised_mr}
                  </p>
                ),
              },
            ]}
          />
        </div>
      </div>
    </ContentLayout>
  );
};

export default RecordListPage;
