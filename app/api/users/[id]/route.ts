import { NextResponse } from "next/server";

import { withPrivateDb } from "@/lib/with-db";
import { handleApiError, ApiError } from "@/lib/error-handler";
import { UserService } from "@/services/UserService";
import { objectIdParamSchema } from "@/validations/params";

export const GET = withPrivateDb(
  async (_request: Request, context: { params: { id: string } }) => {
    try {
      const { id } = objectIdParamSchema.parse(context.params);

      const user = await UserService.getUserById(id);
      if (!user) {
        throw new ApiError(404, "User not found", "USER_NOT_FOUND");
      }
      return NextResponse.json({ ok: true, user }, { status: 200 });
    } catch (error) {
      return handleApiError(error);
    }
  }
);
