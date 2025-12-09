/**
 * User DTOs - chỉ định nghĩa types, không dùng Elysia validation
 * Validation sẽ được thực hiện bằng custom validators trong controller
 */

export interface CreateUserInput {
  email: string;
  name?: string;
  password: string;
}

export interface UpdateUserInput {
  email?: string;
  name?: string;
  password?: string;
}