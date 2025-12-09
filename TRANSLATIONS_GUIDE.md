# 📚 Hướng dẫn Module-based Translations

## 🎯 Tổng quan

Hệ thống translations được tổ chức theo **module-based architecture**, mỗi module có file translations riêng để dễ quản lý và maintain.

---

## 📁 Cấu trúc

```
src/
├── utils/
│   └── translations.ts          # Common translations (required, email, minLength, invalid)
├── modules/
│   ├── user/
│   │   └── translations.ts   # User-specific translations
│   ├── product/
│   │   └── translations.ts     # Product-specific translations
│   └── auth/
│       └── translations.ts     # Auth-specific translations
```

---

## 🚀 Cách sử dụng

### 1. **Tạo translations cho module mới**

Tạo file `translations.ts` trong module của bạn:

```typescript
// src/modules/product/translations.ts
export const productTranslations = {
  en: {
    productExists: "Product already exists",
    created: "Product created successfully",
    updated: "Product updated successfully",
    found: "Product found successfully",
    foundAll: "Products retrieved successfully",
    productNotFound: "Product not found",
  },
  vi: {
    productExists: "Sản phẩm đã tồn tại",
    created: "Tạo sản phẩm thành công",
    updated: "Cập nhật sản phẩm thành công",
    found: "Tìm thấy sản phẩm",
    foundAll: "Lấy danh sách sản phẩm thành công",
    productNotFound: "Không tìm thấy sản phẩm",
  },
} as const;

export type ProductTranslationKey = keyof typeof productTranslations.en;
```

### 2. **Register translations trong module**

Trong file `module.ts`, import và register translations:

```typescript
// src/modules/product/product.module.ts
import { Module } from "../../core/module";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { registerTranslations } from "../../utils/translations";
import { productTranslations } from "./translations";

// Register product module translations
registerTranslations("product", productTranslations);

@Module({
  providers: [ProductService],
  controllers: [ProductController],
  routes: [
    {
      path: "/products",
      controller: ProductController,
    },
  ],
})
export class ProductModule {}
```

### 3. **Sử dụng translations**

Sử dụng `translate()` function như bình thường:

```typescript
import { translate } from "../../utils/translations";

// Trong controller hoặc service
translate("productExists", lang);
translate("created", lang);
translate("foundAll", lang);
```

---

## 📝 Common Translations

Các translations chung (dùng cho tất cả modules) nằm trong `src/utils/translations.ts`:

- `required` - Field is required
- `email` - Invalid email format
- `minLength` - Minimum length validation
- `invalid` - Invalid request data

**Không cần register**, tự động có sẵn.

---

## 🎨 Best Practices

### 1. **Naming Convention**
- Module translations: `{moduleName}Translations`
- Type: `{ModuleName}TranslationKey`
- File: `translations.ts`

### 2. **Translation Keys**
- Sử dụng camelCase: `userExists`, `productNotFound`
- Mô tả rõ ràng: `created`, `updated`, `found`, `foundAll`
- Consistent naming: giữ pattern giống nhau giữa các modules

### 3. **Module-specific vs Common**
- **Module-specific**: Chỉ dùng trong module đó (ví dụ: `userExists`, `productNotFound`)
- **Common**: Dùng chung cho tất cả modules (ví dụ: `required`, `email`, `invalid`)

### 4. **Parameters**
Sử dụng `$param` để thay thế giá trị:

```typescript
// Translation
required: "$field không được để trống"

// Usage
translate("required", lang, { field: "Email" })
// Result: "Email không được để trống"
```

---

## 📊 Ví dụ hoàn chỉnh

### User Module

```typescript
// src/modules/user/translations.ts
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
```

### Product Module

```typescript
// src/modules/product/translations.ts
export const productTranslations = {
  en: {
    productExists: "Product already exists",
    created: "Product created successfully",
    updated: "Product updated successfully",
    found: "Product found successfully",
    foundAll: "Products retrieved successfully",
    productNotFound: "Product not found",
    outOfStock: "Product is out of stock",
  },
  vi: {
    productExists: "Sản phẩm đã tồn tại",
    created: "Tạo sản phẩm thành công",
    updated: "Cập nhật sản phẩm thành công",
    found: "Tìm thấy sản phẩm",
    foundAll: "Lấy danh sách sản phẩm thành công",
    productNotFound: "Không tìm thấy sản phẩm",
    outOfStock: "Sản phẩm đã hết hàng",
  },
} as const;
```

---

## ✅ Lợi ích

1. **Modular**: Mỗi module tự quản lý translations
2. **Maintainable**: Dễ tìm và sửa translations
3. **Scalable**: Dễ thêm module mới
4. **Co-location**: Translations gần với code sử dụng
5. **Type-safe**: TypeScript hỗ trợ autocomplete

---

## 🔄 Migration từ file chung

Nếu bạn đang có translations trong file chung:

1. Tạo `translations.ts` trong module
2. Di chuyển module-specific translations vào đó
3. Register trong `module.ts`
4. Giữ common translations trong `utils/translations.ts`

---

## 📌 Lưu ý

- **Common translations** (`required`, `email`, `minLength`, `invalid`) luôn có sẵn
- **Module translations** phải được register trong `module.ts`
- Translations được merge tự động, không cần import riêng
- `translate()` function tự động tìm trong common + tất cả module translations

