export const translations = {
  en: {
    required: "Field '$field' is required",
    email: "Field '$field' must be a valid email",
    minLength: "Field '$field' must have at least $min characters",
    userExists: "User already exists",
    created: "User created successfully",
    updated: "User updated successfully",
    found: "User found successfully",
    foundAll: "Users retrieved successfully",
    userNotFound: "User not found",
    invalid: "Invalid request data",
  },
  vi: {
    required: "$field không được để trống",
    email: "Trường '$field' phải là email hợp lệ",
    minLength: "Trường '$field' phải có ít nhất $min ký tự",
    userExists: "Người dùng đã tồn tại",
    created: "Tạo người dùng thành công",
    updated: "Cập nhật người dùng thành công",
    found: "Tìm thấy người dùng",
    foundAll: "Lấy danh sách người dùng thành công",
    userNotFound: "Không tìm thấy người dùng",
    invalid: "Dữ liệu không hợp lệ",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
export type Language = keyof typeof translations;

export const translate = (
  key: TranslationKey,
  lang: Language = "vi",
  params?: Record<string, string | number>
): string => {
  const template = translations[lang][key] || translations.vi[key];
  
  if (!params) return template;
  
  let result: string = template;
  for (const [paramKey, paramValue] of Object.entries(params)) {
    result = result.replace(`$${paramKey}`, String(paramValue));
  }
  
  return result;
};

