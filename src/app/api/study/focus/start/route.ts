import {
  NextResponse,
} from "next/server";

import {
  startFocusSession,
} from "@/services/study/focus-session-service";

export async function POST(
  request: Request,
) {
  try {
    const formData =
      await request.formData();

    const studyItemId =
      formData.get(
        "studyItemId",
      );

    if (
      typeof studyItemId !==
      "string" ||
      !studyItemId
    ) {
      return NextResponse.json(
        {
          error:
            "Study item ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const session =
      await startFocusSession(
        studyItemId,
      );

    return NextResponse.json(
      {
        success: true,
        session,
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to start focus session.";

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 400,
      },
    );
  }
}