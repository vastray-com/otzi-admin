import { useMemo } from 'react';
import { service } from '@/utils/service';

export const useApi = () => {
  const record = useMemo(
    () => ({
      getRecordList: (params: Record.GetListParams) =>
        service.post('/note/list', params) as Promise<
          APIRes<PaginationData<Record.Item>>
        >,
    }),
    [],
  );

  const user = useMemo(
    () => ({
      login: (params: User.LoginParams) =>
        service.post('/login/admin_login', params) as Promise<
          APIRes<User.LoginRes>
        >,
    }),
    [],
  );

  return {
    recordApi: record,
    userApi: user,
  };
};
