export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  token: string;
};

export type JwtPayload = {
  sub?: string;
  role?: string;
  iat?: number;
  exp?: number;
};

export type UserRole = 'ROLE_DASIG_ADMIN' | 'ROLE_STAFF' | 'ROLE_TBI_MANAGER';
