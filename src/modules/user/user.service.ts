import { prismaClient } from "../prisma/prisma";
import type { CreateUserInput, UpdateUserInput } from "./user.dto";
import { ValidationError } from "../../errors";
import { NotFoundError } from "../../errors";
import { translate, type Language } from "../../utils/translations";

export class UserService {
  async create(data: CreateUserInput, lang: Language = "vi") {
    try {
      return await prismaClient.user.create({ data });
    } catch (error: any) {
      // Prisma unique constraint error (P2002)
      if (error?.code === "P2002") {
        const field = error.meta?.target?.[0] || "field";
        throw new ValidationError({
          [field]: translate("userExists", lang)
        }, lang);
      }
      // Re-throw other errors
      throw error;
    }
  }

  async findAll(lang: Language = "vi") {
    const users = await prismaClient.user.findMany();
    return users;
  }

  async findById(id: string, lang: Language = "vi") {
    const user = await prismaClient.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundError(translate("userNotFound", lang));
    }
    return user;
  }

  async update(id: string, data: UpdateUserInput, lang: Language = "vi") {
    try {
      // Kiểm tra user có tồn tại không
      const existingUser = await prismaClient.user.findUnique({ where: { id } });
      if (!existingUser) {
        throw new NotFoundError(translate("userNotFound", lang));
      }

      // Cập nhật user
      const updatedUser = await prismaClient.user.update({
        where: { id },
        data
      });

      return updatedUser;
    } catch (error: any) {
      // Nếu là NotFoundError, re-throw
      if (error instanceof NotFoundError) {
        throw error;
      }
      
      // Prisma unique constraint error (P2002) - email đã tồn tại
      if (error?.code === "P2002") {
        const field = error.meta?.target?.[0] || "field";
        throw new ValidationError({
          [field]: translate("userExists", lang)
        }, lang);
      }
      
      // Re-throw other errors
      throw error;
    }
  }
}
