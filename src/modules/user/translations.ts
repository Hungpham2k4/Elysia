/**
 * User module translations
 */
export const userTranslations = {
  en: {
    userExists: "User already exists",
    created: "User created successfully",
    updated: "User updated successfully",
    found: "User found successfully",
    foundAll: "Users retrieved successfully",
    userNotFound: "User not found",
  },
  vi: {
    userExists: "Người dùng đã tồn tại",
    created: "Tạo người dùng thành công",
    updated: "Cập nhật người dùng thành công",
    found: "Tìm thấy người dùng",
    foundAll: "Lấy danh sách người dùng thành công",
    userNotFound: "Không tìm thấy người dùng",
  },
} as const;

export type UserTranslationKey = keyof typeof userTranslations.en;

