# 🚀 Teamwork Server

Backend API server được xây dựng với **Elysia.js** và **Bun runtime**, sử dụng kiến trúc **Module-based Dependency Injection** tương tự **NestJS** và **Spring Boot**.

## ✨ Features

- 🏗️ **Module-based Architecture** - Tổ chức code theo modules, dễ mở rộng và maintain
- 💉 **Dependency Injection** - Hệ thống DI tự động với decorators (`@Service`, `@Controller`, `@Inject`)
- 🌍 **i18n Support** - Hỗ trợ đa ngôn ngữ (English/Vietnamese) với module-based translations
- 🛡️ **Error Handling** - Centralized error handling với custom error classes
- 📝 **Type Safety** - TypeScript strict mode với type-safe DI
- 🔄 **Auto Route Registration** - Tự động đăng ký routes từ modules
- 🗄️ **Prisma ORM** - Type-safe database access với MariaDB/MySQL adapter
- ✅ **Custom Validation** - Custom validators với full control over error formatting

## 📋 Prerequisites

- **Bun** >= 1.0.0 ([Install Bun](https://bun.sh))
- **Node.js** >= 18.0.0 (optional, for Prisma CLI)
- **Database** (MariaDB/MySQL)

## 🚀 Getting Started

### 1. Install Dependencies

```bash
bun install
```

### 2. Setup Environment Variables

```bash
# Copy .env.example to .env and configure database
cp .env.example .env
```

Edit `.env` file with your database credentials:

```env
NODE_ENV=development
PORT=2912
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=your_password_here
DATABASE_NAME=teamwork_db
```

### 3. Setup Database

```bash
# Run Prisma migrations
bunx prisma migrate dev
```

### 4. Start Development Server

```bash
bun run dev
```

Server sẽ chạy tại: `http://localhost:2912`

## 📁 Project Structure

```
src/
├── main.ts                    # Application entry point
├── app.module.ts             # Root module (imports all feature modules)
│
├── core/                     # Core DI system
│   ├── container.ts          # DI Container (manages dependencies)
│   ├── decorators.ts         # @Service, @Controller, @Inject, @Module
│   ├── module.ts             # Module system & route discovery
│   ├── route-registry.ts     # Auto route registration
│   └── types.ts              # Type definitions
│
├── modules/                  # Feature modules
│   ├── user/
│   │   ├── user.module.ts    # Module configuration
│   │   ├── user.controller.ts # HTTP handlers
│   │   ├── user.service.ts   # Business logic
│   │   ├── user.dto.ts       # Data Transfer Objects (TypeScript interfaces)
│   │   ├── translations.ts   # Module-specific translations
│   │   └── index.ts          # Module exports
│   ├── auth/                 # Auth module (similar structure)
│   └── prisma/
│       └── prisma.ts         # Prisma client configuration
│
├── errors/                   # Custom error classes
│   ├── BaseError.ts
│   ├── ValidationError.ts
│   ├── NotFoundError.ts
│   ├── DatabaseError.ts
│   ├── AuthError.ts
│   ├── PermissionError.ts
│   └── index.ts
│
├── plugins/                  # Elysia plugins
│   └── errorHandler.ts       # Global error handler
│
└── utils/                    # Utilities
    ├── translations.ts       # Translation system (common + module registry)
    ├── lang.ts               # Language detection
    └── validators.ts         # Custom validation functions
```

## 🏗️ Architecture Overview

### Module System

Dự án sử dụng **module-based architecture** tương tự NestJS:

```typescript
// src/modules/user/user.module.ts
import { Module } from "../../core/module";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { registerTranslations } from "../../utils/translations";
import { userTranslations } from "./translations";

// Register module translations
registerTranslations("user", userTranslations);

@Module({
  providers: [UserService],      // Services (business logic)
  controllers: [UserController], // Controllers (HTTP handlers)
  routes: [
    {
      path: "/users",
      controller: UserController,
    },
  ],
})
export class UserModule {}
```

### Dependency Injection

**Service** với `@Service()` decorator:

```typescript
// src/modules/user/user.service.ts
import { Service } from "../../core/decorators";
import { prismaClient } from "../prisma/prisma";

@Service()
export class UserService {
  async findAll(lang: Language = "vi") {
    return await prismaClient.user.findMany();
  }
}
```

**Controller** với `@Controller()` và `@Inject()`:

```typescript
// src/modules/user/user.controller.ts
import { Controller, Inject } from "../../core/decorators";
import type { IController } from "../../core/types";
import { Elysia } from "elysia";

@Controller()
export class UserController implements IController {
  constructor(
    @Inject(UserService) private readonly userService: UserService
  ) {}

  registerRoutes(app: Elysia): Elysia {
    return app
      .get("/", async ({ request }) => {
        const lang = getLang(request.headers);
        const users = await this.userService.findAll(lang);
        return { message: translate("foundAll", lang), data: users };
      });
  }
}
```

### Module Registration

Import modules vào `AppModule`:

```typescript
// src/app.module.ts
import { Module } from "./core/module";
import { UserModule } from "./modules/user";

@Module({
  imports: [UserModule],
})
export class AppModule {}
```

Routes sẽ tự động được đăng ký từ tất cả modules.

## 🌍 Internationalization (i18n)

### Module-based Translations

Mỗi module có file translations riêng:

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

Register trong module:

```typescript
import { registerTranslations } from "../../utils/translations";
import { userTranslations } from "./translations";

registerTranslations("user", userTranslations);
```

### Common Translations

Common translations (dùng chung cho tất cả modules) trong `src/utils/translations.ts`:
- `required` - Field is required
- `email` - Invalid email format
- `minLength` - Minimum length validation
- `invalid` - Invalid request data

### Usage

```typescript
import { translate } from "../../utils/translations";

// In controller or service
translate("userExists", lang);
translate("created", lang, { field: "User" });
```

Language được detect từ `Accept-Language` header (default: `vi`).

## ✅ Custom Validation

Dự án sử dụng **custom validators** thay vì Elysia's built-in validation để có full control over error formatting.

### Available Validators

```typescript
import { validateEmail, validatePassword, validateRequired, validateOptionalString } from "../../utils/validators";

// Email validation
const email = validateEmail(body?.email, "email", lang);

// Password validation với minLength
const password = validatePassword(body?.password, 6, "password", lang);

// Required string validation
const name = validateRequired(body?.name, "name", lang);

// Optional string validation
const optionalName = validateOptionalString(body?.name, "name", lang);
```

### Usage in Controller

```typescript
.post("/", async ({ body, request }) => {
  const lang = getLang(request.headers);
  
  // Custom validation - throw ValidationError nếu có lỗi
  const validatedBody: CreateUserInput = {
    email: validateEmail(body?.email, "email", lang),
    name: validateOptionalString(body?.name, "name", lang),
    password: validatePassword(body?.password, 6, "password", lang)
  };
  
  const user = await this.userService.create(validatedBody, lang);
  
  return {
    message: translate("created", lang),
    data: user
  };
})
```

### Error Format

Validation errors được trả về với format:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Dữ liệu không hợp lệ",
  "fields": {
    "email": "Email không được để trống",
    "password": "Mật khẩu ≥ 6 ký tự"
  },
  "timestamp": 1765268880359
}
```

## 🛡️ Error Handling

### Custom Error Classes

```typescript
// Throw custom errors
throw new ValidationError({ email: "Email is required" }, lang);
throw new NotFoundError("User not found");
throw new DatabaseError("Database connection failed");
```

### Global Error Handler

Tất cả errors được xử lý bởi `errorHandler.ts` plugin:
- Custom errors → Formatted JSON response
- Validation errors → Field-level error messages với i18n
- Prisma errors → Database error messages
- 404 errors → Not found messages

### Error Response Format

```json
{
  "error": "ERROR_TYPE",
  "message": "Error message",
  "fields": { /* For ValidationError */ },
  "timestamp": 1765268880359
}
```

## 📝 API Examples

### Create User

```bash
POST /users
Content-Type: application/json
Accept-Language: en

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

**Success Response:**
```json
{
  "message": "User created successfully",
  "data": {
    "id": "xxx",
    "email": "user@example.com",
    "name": "John Doe",
    "password": "password123"
  }
}
```

**Error Response (Validation):**
```json
{
  "error": "VALIDATION_ERROR",
  "message": "Dữ liệu không hợp lệ",
  "fields": {
    "email": "Email không được để trống",
    "password": "Mật khẩu ≥ 6 ký tự"
  },
  "timestamp": 1765268880359
}
```

### Get All Users

```bash
GET /users
Accept-Language: vi
```

**Response:**
```json
{
  "message": "Lấy danh sách người dùng thành công",
  "data": [...],
  "count": 10
}
```

### Get User by ID

```bash
GET /users/:id
Accept-Language: en
```

**Response:**
```json
{
  "message": "User found successfully",
  "data": {
    "id": "xxx",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Update User

```bash
PUT /users/:id
Content-Type: application/json

{
  "name": "Jane Doe",
  "email": "jane@example.com"
}
```

**Response:**
```json
{
  "message": "User updated successfully",
  "data": {
    "id": "xxx",
    "email": "jane@example.com",
    "name": "Jane Doe"
  }
}
```

## 🎯 Adding a New Module

### 1. Create Module Structure

```bash
src/modules/product/
├── product.module.ts
├── product.controller.ts
├── product.service.ts
├── product.dto.ts
├── translations.ts
└── index.ts
```

### 2. Create DTO (TypeScript interfaces)

```typescript
// product.dto.ts
export interface CreateProductInput {
  name: string;
  price: number;
  description?: string;
}

export interface UpdateProductInput {
  name?: string;
  price?: number;
  description?: string;
}
```

### 3. Create Service

```typescript
// product.service.ts
import { Service } from "../../core/decorators";
import { prismaClient } from "../prisma/prisma";
import type { CreateProductInput, UpdateProductInput } from "./product.dto";

@Service()
export class ProductService {
  async create(data: CreateProductInput, lang: Language = "vi") {
    return await prismaClient.product.create({ data });
  }

  async findAll(lang: Language = "vi") {
    return await prismaClient.product.findMany();
  }
}
```

### 4. Create Controller

```typescript
// product.controller.ts
import { Controller, Inject } from "../../core/decorators";
import type { IController } from "../../core/types";
import { Elysia } from "elysia";
import { ProductService } from "./product.service";
import { getLang } from "../../utils/lang";
import { translate } from "../../utils/translations";
import { validateRequired, validateOptionalString } from "../../utils/validators";

@Controller()
export class ProductController implements IController {
  constructor(
    @Inject(ProductService) private readonly productService: ProductService
  ) {}

  registerRoutes(app: Elysia): Elysia {
    return app
      .get("/", async ({ request }) => {
        const lang = getLang(request.headers);
        const products = await this.productService.findAll(lang);
        return { message: translate("foundAll", lang), data: products };
      })
      .post("/", async ({ body, request }) => {
        const lang = getLang(request.headers);
        
        const validatedBody = {
          name: validateRequired(body?.name, "name", lang),
          price: Number(body?.price),
          description: validateOptionalString(body?.description, "description", lang)
        };
        
        const product = await this.productService.create(validatedBody, lang);
        return { message: translate("created", lang), data: product };
      });
  }
}
```

### 5. Create Translations

```typescript
// translations.ts
export const productTranslations = {
  en: {
    created: "Product created successfully",
    foundAll: "Products retrieved successfully",
  },
  vi: {
    created: "Tạo sản phẩm thành công",
    foundAll: "Lấy danh sách sản phẩm thành công",
  },
} as const;
```

### 6. Create Module

```typescript
// product.module.ts
import { Module } from "../../core/module";
import { ProductService } from "./product.service";
import { ProductController } from "./product.controller";
import { registerTranslations } from "../../utils/translations";
import { productTranslations } from "./translations";

registerTranslations("product", productTranslations);

@Module({
  providers: [ProductService],
  controllers: [ProductController],
  routes: [
    { path: "/products", controller: ProductController },
  ],
})
export class ProductModule {}
```

### 7. Export Module

```typescript
// index.ts
export * from "./product.module";
export * from "./product.service";
export * from "./product.controller";
```

### 8. Import into AppModule

```typescript
// app.module.ts
import { Module } from "./core/module";
import { UserModule } from "./modules/user";
import { ProductModule } from "./modules/product";

@Module({
  imports: [UserModule, ProductModule], // Add here
})
export class AppModule {}
```

Routes sẽ tự động được đăng ký! ✨

## 🧪 Development

### Run in Development Mode

```bash
bun run dev
```

### Database Migrations

```bash
# Create migration
bunx prisma migrate dev --name migration_name

# Apply migrations
bunx prisma migrate deploy
```

### Prisma Studio

```bash
bunx prisma studio
```

## 📚 Tech Stack

- **Runtime**: [Bun](https://bun.sh) - Fast JavaScript runtime
- **Framework**: [Elysia.js](https://elysiajs.com) - Fast and friendly web framework
- **ORM**: [Prisma](https://www.prisma.io) - Next-generation ORM
- **Database**: MariaDB/MySQL (via Prisma adapter)
- **Language**: TypeScript with strict mode
- **DI System**: Custom implementation (inspired by NestJS/Spring Boot)

## 🎨 Design Patterns

- **Module Pattern** - Feature-based modules
- **Dependency Injection** - Constructor injection with decorators
- **Repository Pattern** - Service layer abstraction
- **Decorator Pattern** - `@Service`, `@Controller`, `@Inject`, `@Module`
- **Factory Pattern** - DI Container factory methods

## 📖 Documentation

- [Architecture Review](./ARCHITECTURE_REVIEW.md) - Chi tiết về kiến trúc và so sánh với NestJS/Spring Boot

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Inspired by [NestJS](https://nestjs.com) and [Spring Boot](https://spring.io/projects/spring-boot)
- Built with [Elysia.js](https://elysiajs.com) and [Bun](https://bun.sh)

---

Made with ❤️ using Elysia.js and Bun
