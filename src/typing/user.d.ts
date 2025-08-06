declare namespace User {
  type LoginParams = {
    login: string;
    pass: string;
  };

  type LoginRes = {
    login: string;
    token: string;
    expires_at: string;
  };
}
