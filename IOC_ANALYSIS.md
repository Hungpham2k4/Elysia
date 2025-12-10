# 🔄 Inversion of Control (IoC) trong Project

## 📋 Tổng quan

**Có, project này có Inversion of Control (IoC)** và được triển khai đầy đủ thông qua hệ thống **Dependency Injection (DI)** tương tự NestJS và Spring Boot.

## 🎯 IoC là gì?

**Inversion of Control (IoC)** là một design pattern trong đó:
- **Control flow bị đảo ngược**: Thay vì code gọi framework, **framework gọi code**
- **Dependencies được inject từ bên ngoài**: Thay vì class tự tạo dependencies, **framework tạo và inject vào**
- **Lifecycle được quản lý bởi framework**: Framework quyết định khi nào tạo, sử dụng và hủy objects

## ✅ IoC được thể hiện ở đâu?

### 1. **DI Container** (`src/core/container.ts`)

Đây là **trái tim của IoC** trong project:

```typescript
export class Container {
  private services = new Map<Token, ServiceDefinition>();
  private instances = new Map<Token, unknown>();

  // Register service vào container
  register<T>(token: Token, factory: Factory<T>): void { ... }

  // Resolve dependency - Framework tự động tạo instance
  resolve<T>(token: Token): T {
    // Framework quyết định khi nào tạo instance
    // Framework quản lý singleton scope
    // Framework tự động resolve dependencies
  }
}
```

**IoC ở đây:**
- ✅ Framework (Container) quản lý lifecycle của services
- ✅ Framework tự động resolve dependencies
- ✅ Framework quyết định khi nào tạo instance (singleton/transient)
- ✅ Code không cần biết cách tạo dependencies

### 2. **Module System** (`src/core/module.ts`)

Module system tự động đăng ký và quản lý dependencies:

```typescript
export function Module(config: ModuleConfig) {
  return function <T extends new () => any>(target: T): T {
    // Framework tự động register providers
    if (config.providers) {
      config.providers.forEach((Provider) => {
        container.registerClass(Provider); // Framework quản lý
      });
    }

    // Framework tự động register controllers với DI
    if (config.controllers) {
      config.controllers.forEach((Controller) => {
        // Framework tự động detect và inject dependencies
        const controllerInjections = Reflect.getMetadata(MetadataKeys.INJECT, Controller);
        container.register(Controller.name, () => {
          // Framework tự động resolve và inject
          const args = controllerInjections
            .map((injection) => container.resolve(injection.token));
          return new Controller(...args);
        });
      });
    }
  };
}
```

**IoC ở đây:**
- ✅ Framework tự động scan và register classes
- ✅ Framework tự động detect dependencies qua metadata
- ✅ Framework tự động inject dependencies vào constructor
- ✅ Code chỉ cần khai báo, framework làm phần còn lại

### 3. **Constructor Injection** (`src/modules/user/user.controller.ts`)

Dependencies được inject từ bên ngoài, không phải class tự tạo:

```typescript
@Controller()
export class UserController implements IController {
  // ❌ KHÔNG tự tạo: private userService = new UserService();
  // ✅ Framework inject từ bên ngoài:
  constructor(
    @Inject(UserService) private readonly userService: UserService
  ) {}
}
```

**IoC ở đây:**
- ✅ `UserController` **không tự tạo** `UserService`
- ✅ Framework (Container) **tự động tạo và inject** `UserService`
- ✅ Control được đảo ngược: Framework quyết định khi nào tạo và inject

### 4. **Decorators với Metadata** (`src/core/decorators.ts`)

Decorators lưu metadata để framework biết cách inject:

```typescript
// Service decorator - Framework biết đây là service
export function Service(options?: { scope?: "singleton" | "transient" }) {
  return function <T extends new (...args: any[]) => any>(target: T): T {
    Reflect.defineMetadata(SERVICE_METADATA, { scope: "singleton" }, target);
    return target;
  };
}

// Inject decorator - Framework biết cần inject gì
export function Inject(token: string | Function) {
  return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number): void {
    const existingInjections = Reflect.getMetadata(INJECT_METADATA, target) || [];
    existingInjections.push({
      index: parameterIndex,
      token: typeof token === "function" ? token.name : token,
    });
    Reflect.defineMetadata(INJECT_METADATA, existingInjections, target);
  };
}
```

**IoC ở đây:**
- ✅ Framework đọc metadata để biết cách inject
- ✅ Code chỉ cần đánh dấu, framework tự động xử lý
- ✅ Framework quyết định cách resolve dependencies

### 5. **Auto Registration** (`src/main.ts` và `src/core/route-registry.ts`)

Framework tự động đăng ký routes và tạo instances:

```typescript
// main.ts
const appModule = new AppModule(); // Framework tự động register tất cả

// route-registry.ts
export function registerRoutes(app: Elysia, routes: RouteConfig[]): void {
  routes.forEach((route) => {
    const controller = container.resolve(route.controller); // Framework tự động tạo
    controller.registerRoutes(app.group(route.path));
  });
}
```

**IoC ở đây:**
- ✅ Framework tự động scan modules
- ✅ Framework tự động tạo controller instances
- ✅ Framework tự động đăng ký routes
- ✅ Code chỉ cần khai báo trong module, framework làm phần còn lại

## 🔄 Flow của IoC trong Project

### **Traditional Control (KHÔNG có IoC):**
```
UserController → tự tạo → UserService → tự tạo → PrismaClient
```
❌ Tight coupling, khó test, khó maintain

### **IoC Control (CÓ IoC):**
```
Framework (Container) → tạo PrismaClient
                     → tạo UserService (inject PrismaClient)
                     → tạo UserController (inject UserService)
                     → đăng ký routes
```
✅ Loose coupling, dễ test, dễ maintain

## 📊 So sánh: Có IoC vs Không có IoC

### **❌ Không có IoC (Traditional):**

```typescript
// UserController tự tạo UserService
export class UserController {
  private userService = new UserService(); // ❌ Tight coupling
  
  async getUsers() {
    return await this.userService.findAll();
  }
}

// UserService tự tạo PrismaClient
export class UserService {
  private prisma = new PrismaClient(); // ❌ Tight coupling
  
  async findAll() {
    return await this.prisma.user.findMany();
  }
}
```

**Vấn đề:**
- ❌ Khó test (không thể mock dependencies)
- ❌ Tight coupling
- ❌ Khó thay đổi implementation
- ❌ Không thể quản lý lifecycle (singleton, etc.)

### **✅ Có IoC (Project này):**

```typescript
// UserController nhận UserService từ framework
@Controller()
export class UserController {
  constructor(
    @Inject(UserService) private readonly userService: UserService // ✅ Injected
  ) {}
}

// UserService được quản lý bởi framework
@Service()
export class UserService {
  // PrismaClient được inject hoặc import trực tiếp
  async findAll() {
    return await prismaClient.user.findMany();
  }
}
```

**Lợi ích:**
- ✅ Dễ test (có thể mock dependencies)
- ✅ Loose coupling
- ✅ Dễ thay đổi implementation
- ✅ Framework quản lý lifecycle (singleton)

## 🎯 Các thành phần IoC trong Project

| Thành phần | File | Vai trò trong IoC |
|------------|------|-------------------|
| **Container** | `src/core/container.ts` | Quản lý dependencies, resolve và inject |
| **Module Decorator** | `src/core/module.ts` | Tự động register providers và controllers |
| **Service Decorator** | `src/core/decorators.ts` | Đánh dấu class là service, lưu metadata |
| **Controller Decorator** | `src/core/decorators.ts` | Đánh dấu class là controller |
| **Inject Decorator** | `src/core/decorators.ts` | Đánh dấu constructor parameter cần inject |
| **Route Registry** | `src/core/route-registry.ts` | Tự động tạo controller instances và đăng ký routes |
| **App Module** | `src/app.module.ts` | Root module, framework tự động scan |

## 🔍 Ví dụ cụ thể: IoC trong action

### **Bước 1: Khai báo Service**
```typescript
// user.service.ts
@Service() // Framework biết đây là service
export class UserService {
  async findAll() { ... }
}
```

### **Bước 2: Khai báo Controller với Dependency**
```typescript
// user.controller.ts
@Controller() // Framework biết đây là controller
export class UserController {
  constructor(
    @Inject(UserService) private readonly userService: UserService
    // ↑ Framework sẽ inject UserService vào đây
  ) {}
}
```

### **Bước 3: Đăng ký trong Module**
```typescript
// user.module.ts
@Module({
  providers: [UserService],      // Framework tự động register
  controllers: [UserController], // Framework tự động register và inject
})
export class UserModule {}
```

### **Bước 4: Framework tự động xử lý**
```typescript
// Khi AppModule được khởi tạo:
// 1. Framework scan UserModule
// 2. Framework register UserService vào Container
// 3. Framework register UserController vào Container
// 4. Framework detect UserController cần UserService
// 5. Framework tạo UserService instance (singleton)
// 6. Framework inject UserService vào UserController constructor
// 7. Framework tạo UserController instance
// 8. Framework đăng ký routes từ UserController
```

**Kết quả:** Code không cần tự tạo bất kỳ instance nào, framework làm tất cả! ✨

## 📈 Mức độ IoC trong Project

| Aspect | Mức độ | Ghi chú |
|--------|--------|---------|
| **Dependency Injection** | ⭐⭐⭐⭐⭐ | Full constructor injection |
| **Lifecycle Management** | ⭐⭐⭐⭐ | Singleton scope, có thể thêm transient |
| **Auto Registration** | ⭐⭐⭐⭐ | Tự động scan modules, có thể cải thiện route discovery |
| **Metadata Reflection** | ⭐⭐⭐⭐⭐ | Sử dụng reflect-metadata đầy đủ |
| **Container** | ⭐⭐⭐⭐⭐ | Hoàn chỉnh với resolve, register, singleton |

**Tổng thể: 4.8/5.0** - IoC được triển khai rất tốt! 🎉

## 🎓 Kết luận

**Project này có IoC đầy đủ** thông qua:

1. ✅ **DI Container** - Quản lý dependencies và lifecycle
2. ✅ **Module System** - Tự động register và scan
3. ✅ **Constructor Injection** - Dependencies được inject từ bên ngoài
4. ✅ **Decorators với Metadata** - Framework biết cách inject
5. ✅ **Auto Registration** - Framework tự động tạo instances và đăng ký routes

**IoC được thể hiện rõ ràng nhất ở:**
- `Container.resolve()` - Framework tự động tạo và inject dependencies
- `@Module()` decorator - Framework tự động scan và register
- `@Inject()` decorator - Framework tự động inject vào constructor
- `registerRoutes()` - Framework tự động tạo controller instances

Đây là một implementation **rất giống NestJS và Spring Boot** về mặt IoC pattern! 🚀

