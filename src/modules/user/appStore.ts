import type { UserService } from "./user.service";

export interface AppStore {
  userService: UserService;
}
