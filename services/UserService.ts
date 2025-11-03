import User, { UserDocument } from "@/models/User";
import { paginate } from "@/lib/paginate";
import type { PaginationParams, PaginationResult } from "@/lib/pagination";

export class UserService {
  static async getUserById(userId: string): Promise<UserDocument | null> {
    return User.findById(userId).lean<UserDocument | null>();
  }

  static async getPaginatedUsers(
    params?: PaginationParams
  ): Promise<PaginationResult<UserDocument>> {
    return paginate<UserDocument>(User, params);
  }
}
