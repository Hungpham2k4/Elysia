import { t } from "elysia";

export const CreateUserDto = t.Object({
  email: t.String({ format: "email", error: "Email không hợp lệ" }),
  name: t.Optional(t.String()),
  password: t.String({ minLength: 6, error: "Mật khẩu ≥ 6 ký tự" })
});

export type CreateUserInput = typeof CreateUserDto.static;

export const UpdateUserDto = t.Object({
  email: t.Optional(t.String({ format: "email", error: "Email không hợp lệ" })),
  name: t.Optional(t.String()),
  password: t.Optional(t.String({ minLength: 6, error: "Mật khẩu ≥ 6 ký tự" }))
});

export type UpdateUserInput = typeof UpdateUserDto.static;