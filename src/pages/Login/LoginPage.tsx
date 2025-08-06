import { App, Button, Card, Form, Input } from 'antd';
import { useNavigate } from 'react-router';
import { useApi } from '@/hooks/useApi';
import { DEFAULT_PRIVATE_PATH } from '@/router/privateRoutes';
import { useUserStore } from '@/store/useUserStore';
import { ls } from '@/utils/ls';

const LoginPage = () => {
  const nav = useNavigate();
  const { message } = App.useApp();

  const setUser = useUserStore((s) => s.setUser);

  const { userApi } = useApi();
  const onLogin = async (values: User.LoginParams) => {
    const res = await userApi.login(values);
    if (res.code !== 200) {
      message.error(res.msg || '登录失败，请稍后再试');
      return;
    }
    console.log('登录成功：', res.data);

    ls.token.set(res.data.token);
    const user = { name: res.data.login };
    ls.user.set(user);
    setUser(user);
    nav(DEFAULT_PRIVATE_PATH);
  };

  return (
    <main className="flex flex-col gap-y-[16px] justify-center items-center h-full w-full bg-[#f4f4f4]">
      <Card className="w-[400px] p-[24px]">
        <Form<User.LoginParams>
          className="flex flex-col gap-y-[16px]"
          onFinish={onLogin}
        >
          <h1 className="text-[28px] text-center font-medium">登录页</h1>

          <div className="flex flex-col gap-y-[16px]">
            <Form.Item
              name="login"
              label={null}
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input
                placeholder="输入用户名"
                size="large"
                prefix={
                  <i className="i-icon-park-outline:user text-[20px] opacity-72" />
                }
              />
            </Form.Item>
            <Form.Item
              name="pass"
              label={null}
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password
                placeholder="输入密码"
                size="large"
                prefix={
                  <i className="i-icon-park-outline:lock text-[20px] opacity-72" />
                }
              />
            </Form.Item>
          </div>

          <Form.Item noStyle>
            <Button type="primary" htmlType="submit" size="large">
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </main>
  );
};

export default LoginPage;
