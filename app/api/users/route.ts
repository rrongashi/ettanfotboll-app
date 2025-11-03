import { NextResponse } from "next/server";

import { withPrivateDb } from "@/lib/with-db";
import { handleApiError } from "@/lib/error-handler";
import { parseQuery } from "@/lib/parse-query";
import { paginationSchema } from "@/validations/pagination";
import { UserService } from "@/services/UserService";

export const GET = withPrivateDb(async (request: Request) => {
  try {
    const query = parseQuery(request.url, paginationSchema);
    const result = await UserService.getPaginatedUsers(query);
    return NextResponse.json(
      { ok: true, data: result.data, metadata: result.metadata },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
});
