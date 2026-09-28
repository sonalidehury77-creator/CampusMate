import { createClient } from "@/lib/supabase/server";

export type ProfilePageData = {
  user: {
    id: string;
    email: string | null;
    lastSignInAt: string | null;
    createdAt: string;
  };

  profile: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    role: string;
    avatarPath: string | null;
    avatarUrl: string | null;
    createdAt: string;
  };

  academic: {
    studentId: string;
    enrollmentYear: number | null;
    currentSemester: number | null;
    programName: string;
    programCode: string;
    departmentName: string;
    departmentCode: string;
    semesterNumber: number | null;
    academicYear: string;
  } | null;

  notifications: {
    assignment: boolean;
    attendance: boolean;
    notice: boolean;
    exams: boolean;
    study: boolean;
    general: boolean;
    push: boolean;
    email: boolean;
  };

  privacy: {
    profileVisibility: string;
    showEmail: boolean;
    showPhone: boolean;
    allowProfileSearch: boolean;
    loginAlerts: boolean;
    securityAlerts: boolean;
    activityAlerts: boolean;
  };

  activity: {
    id: string;
    action: string;
    entityType: string;
    createdAt: string;
  }[];

  mfaEnabled: boolean;
};

type NotificationPreferenceRow = {
  assignment_notifications: boolean | null;
  notice_notifications: boolean | null;
  attendance_notifications: boolean | null;
  timetable_notifications: boolean | null;
  event_notifications: boolean | null;
  ai_notifications: boolean | null;
  email_notifications: boolean | null;
  push_notifications: boolean | null;
};

type ProfileSettingsRow = {
  profile_visibility: string | null;
  show_email: boolean | null;
  show_phone: boolean | null;
  allow_profile_search: boolean | null;
  login_alerts: boolean | null;
  security_alerts: boolean | null;
  activity_alerts: boolean | null;
};

function text(
  value: unknown,
  fallback = "",
): string {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  return String(value);
}

function booleanValue(
  value: unknown,
  fallback: boolean,
): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  return fallback;
}

function numberValue(
  value: unknown,
): number | null {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : null;
}

export async function getProfilePageData(): Promise<ProfilePageData> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(
      `Failed to load authenticated user: ${userError.message}`,
    );
  }

  if (!user) {
    throw new Error(
      "Authenticated user not found.",
    );
  }

  const [
    profileResult,
    studentResult,
    notificationResult,
    privacyResult,
    activityResult,
    mfaResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        email,
        phone,
        role,
        avatar_url,
        avatar_path,
        created_at
      `)
      .eq("id", user.id)
      .maybeSingle(),

    supabase
      .from("students")
      .select(`
        id,
        student_number,
        enrollment_year,
        current_semester,
        programs (
          id,
          name,
          code,
          departments (
            id,
            name,
            code
          )
        ),
        semesters (
          id,
          semester_number,
          academic_year
        )
      `)
      .eq("profile_id", user.id)
      .maybeSingle(),

    supabase
      .from("notification_preferences")
      .select(`
        assignment_notifications,
        notice_notifications,
        attendance_notifications,
        timetable_notifications,
        event_notifications,
        ai_notifications,
        email_notifications,
        push_notifications
      `)
      .eq("profile_id", user.id)
      .maybeSingle(),

    supabase
      .from("profile_settings")
      .select(`
        profile_visibility,
        show_email,
        show_phone,
        allow_profile_search,
        login_alerts,
        security_alerts,
        activity_alerts
      `)
      .eq("profile_id", user.id)
      .maybeSingle(),

    supabase
      .from("audit_logs")
      .select(`
        id,
        action,
        entity_type,
        created_at
      `)
      .eq("profile_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(25),

    supabase.auth.mfa.listFactors(),
  ]);

  if (profileResult.error) {
    throw new Error(
      `Failed to load profile: ${profileResult.error.message}`,
    );
  }

  if (!profileResult.data) {
    throw new Error(
      "Profile record not found.",
    );
  }

  if (studentResult.error) {
    throw new Error(
      `Failed to load academic profile: ${studentResult.error.message}`,
    );
  }

  if (notificationResult.error) {
    throw new Error(
      `Failed to load notification preferences: ${notificationResult.error.message}`,
    );
  }

  if (privacyResult.error) {
    throw new Error(
      `Failed to load privacy settings: ${privacyResult.error.message}`,
    );
  }

  if (activityResult.error) {
    throw new Error(
      `Failed to load account activity: ${activityResult.error.message}`,
    );
  }

  const profile = profileResult.data;

  const student = studentResult.data;

  /*
   * Supabase can return relationship data as an object
   * or an array depending on the generated relationship type.
   * Normalize both forms here.
   */
  const rawProgram = student?.programs;

  const program = Array.isArray(rawProgram)
    ? rawProgram[0]
    : rawProgram;

  const rawDepartment =
    program?.departments;

  const department =
    Array.isArray(rawDepartment)
      ? rawDepartment[0]
      : rawDepartment;

  const rawSemester =
    student?.semesters;

  const semester =
    Array.isArray(rawSemester)
      ? rawSemester[0]
      : rawSemester;

  /*
   * Profile images are stored in a PRIVATE bucket.
   * Therefore we generate a temporary signed URL.
   */
  let signedAvatarUrl:
    | string
    | null = null;

  if (profile.avatar_path) {
    const {
      data: signedAvatar,
      error: signedAvatarError,
    } = await supabase.storage
      .from("profile-images")
      .createSignedUrl(
        profile.avatar_path,
        3600,
      );

    if (!signedAvatarError) {
      signedAvatarUrl =
        signedAvatar?.signedUrl ??
        null;
    }
  }

  const notificationRow =
    (notificationResult.data ??
      null) as NotificationPreferenceRow | null;

  const privacyRow =
    (privacyResult.data ??
      null) as ProfileSettingsRow | null;

  const factors =
    mfaResult.data?.totp ?? [];

  const mfaEnabled =
    factors.some(
      (factor) =>
        factor.status ===
        "verified",
    );

  return {
    user: {
      id: user.id,
      email: user.email ?? null,
      lastSignInAt:
        user.last_sign_in_at ??
        null,
      createdAt:
        user.created_at,
    },

    profile: {
      id: profile.id,
      fullName: text(
        profile.full_name,
        "Student",
      ),
      email: text(
        profile.email,
        user.email ?? "",
      ),
      phone: text(
        profile.phone,
      ),
      role: text(
        profile.role,
        "student",
      ),
      avatarPath:
        profile.avatar_path ??
        null,
      avatarUrl:
        signedAvatarUrl ??
        profile.avatar_url ??
        null,
      createdAt:
        profile.created_at,
    },

    academic: student
      ? {
          studentId: text(
            student.student_number,
            "—",
          ),

          enrollmentYear:
            numberValue(
              student.enrollment_year,
            ),

          currentSemester:
            numberValue(
              student.current_semester,
            ),

          programName: text(
            program?.name,
            "—",
          ),

          programCode: text(
            program?.code,
            "—",
          ),

          departmentName:
            text(
              department?.name,
              "—",
            ),

          departmentCode:
            text(
              department?.code,
              "—",
            ),

          semesterNumber:
            numberValue(
              semester?.semester_number,
            ),

          academicYear: text(
            semester?.academic_year,
            "—",
          ),
        }
      : null,

    /*
     * IMPORTANT:
     * These are CampusMate's UI-friendly names.
     *
     * The database names are:
     * assignment_notifications
     * notice_notifications
     * attendance_notifications
     * timetable_notifications
     * event_notifications
     * ai_notifications
     * email_notifications
     * push_notifications
     */
    notifications: {
      assignment:
        booleanValue(
          notificationRow
            ?.assignment_notifications,
          true,
        ),

      attendance:
        booleanValue(
          notificationRow
            ?.attendance_notifications,
          true,
        ),

      notice:
        booleanValue(
          notificationRow
            ?.notice_notifications,
          true,
        ),

      /*
       * Exams are represented by the existing
       * notice/academic notification system for now.
       *
       * We keep this UI setting independent so
       * the notification architecture can be
       * expanded later without changing the UI.
       */
      exams:
        booleanValue(
          notificationRow
            ?.notice_notifications,
          true,
        ),

      /*
       * Study-related intelligence currently
       * maps to AI notifications.
       */
      study:
        booleanValue(
          notificationRow
            ?.ai_notifications,
          true,
        ),

      /*
       * General CampusMate notifications currently
       * map to event notifications.
       */
      general:
        booleanValue(
          notificationRow
            ?.event_notifications,
          true,
        ),

      push:
        booleanValue(
          notificationRow
            ?.push_notifications,
          true,
        ),

      email:
        booleanValue(
          notificationRow
            ?.email_notifications,
          true,
        ),
    },

    privacy: {
      profileVisibility:
        text(
          privacyRow
            ?.profile_visibility,
          "campus",
        ),

      showEmail:
        booleanValue(
          privacyRow
            ?.show_email,
          false,
        ),

      showPhone:
        booleanValue(
          privacyRow
            ?.show_phone,
          false,
        ),

      allowProfileSearch:
        booleanValue(
          privacyRow
            ?.allow_profile_search,
          true,
        ),

      loginAlerts:
        booleanValue(
          privacyRow
            ?.login_alerts,
          true,
        ),

      securityAlerts:
        booleanValue(
          privacyRow
            ?.security_alerts,
          true,
        ),

      activityAlerts:
        booleanValue(
          privacyRow
            ?.activity_alerts,
          true,
        ),
    },

    activity: (
      activityResult.data ?? []
    ).map(
      (item) => ({
        id: String(
          item.id,
        ),

        action: text(
          item.action,
          "Activity",
        ),

        entityType:
          text(
            item.entity_type,
            "system",
          ),

        createdAt:
          String(
            item.created_at,
          ),
      }),
    ),

    mfaEnabled,
  };
}