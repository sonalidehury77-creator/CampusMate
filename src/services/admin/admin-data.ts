import { createClient } from "@/lib/supabase/server";

type AdminRow = Record<string, unknown>;

function textValue(
  row: AdminRow,
  key: string,
  fallback = "—",
) {
  const value = row[key];

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  return String(value);
}


export async function getAdminDashboardData() {
  const supabase = await createClient();

  const [
    profilesResult,
    studentsResult,
    facultyResult,
    departmentsResult,
    subjectsResult,
    noticesResult,
    notificationsResult,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, role, created_at"),

    supabase
      .from("students")
      .select("id, profile_id"),

    supabase
      .from("faculty")
      .select("id, profile_id"),

    supabase
      .from("departments")
      .select("*"),

    supabase
      .from("subjects")
      .select("*"),

    supabase
      .from("notices")
      .select(
        "id, title, priority, status, published_at, deadline",
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(10),

    supabase
      .from("notifications")
      .select("id, read_at, created_at")
      .order("created_at", {
        ascending: false,
      })
      .limit(100),
  ]);

  const errors = [
    profilesResult.error,
    studentsResult.error,
    facultyResult.error,
    departmentsResult.error,
    subjectsResult.error,
    noticesResult.error,
    notificationsResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    throw new Error(
      `Failed to load admin dashboard data: ${
        errors[0]?.message ?? "Unknown error"
      }`,
    );
  }

  const profiles = profilesResult.data ?? [];
  const students = studentsResult.data ?? [];
  const faculty = facultyResult.data ?? [];
  const departments = departmentsResult.data ?? [];
  const subjects = subjectsResult.data ?? [];
  const notices = noticesResult.data ?? [];
  const notifications = notificationsResult.data ?? [];

  const adminProfiles = profiles.filter(
    (profile) => profile.role === "admin",
  );

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        notification.read_at === null,
    ).length;

  const publishedNotices = notices.filter(
    (notice) => notice.status === "published",
  ).length;

  return {
    summary: {
      totalUsers: profiles.length,
      students: students.length,
      faculty: faculty.length,
      admins: adminProfiles.length,
      departments: departments.length,
      subjects: subjects.length,
      notices: notices.length,
      publishedNotices,
      unreadNotifications,
    },

    recentNotices: notices,

    departments: departments.slice(0, 8),

    subjects: subjects.slice(0, 8),

    system: {
      generatedAt: new Date().toISOString(),
    },
  };
}

export async function getAdminStudentsData() {
  const supabase = await createClient();

  const {
    data: profiles,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, role, created_at",
    )
    .eq("role", "student")
    .order("created_at", {
      ascending: false,
    });

  if (profileError) {
    throw new Error(
      `Failed to load student profiles: ${profileError.message}`,
    );
  }

  const profileRows = profiles ?? [];
  const profileIds = profileRows.map(
    (profile) => profile.id,
  );

  let students: AdminRow[] = [];

  if (profileIds.length > 0) {
    const {
      data,
      error,
    } = await supabase
      .from("students")
      .select("*")
      .in("profile_id", profileIds);

    if (error) {
      throw new Error(
        `Failed to load students: ${error.message}`,
      );
    }

    students = (data ?? []) as AdminRow[];
  }

  const studentByProfile = new Map(
    students.map((student) => [
      textValue(student, "profile_id", ""),
      student,
    ]),
  );

  return profileRows.map((profile) => {
    const student =
      studentByProfile.get(profile.id) ?? {};

    return {
      id: profile.id,
      fullName:
        profile.full_name ?? "Unnamed Student",
      email: profile.email ?? "—",
      studentNumber: textValue(
        student,
        "student_number",
      ),
      programId: textValue(
        student,
        "program_id",
      ),
      semesterId: textValue(
        student,
        "semester_id",
      ),
      enrollmentYear: textValue(
        student,
        "enrollment_year",
      ),
      createdAt: profile.created_at,
    };
  });
}

export async function getAdminFacultyData() {
  const supabase = await createClient();

  const {
    data: profiles,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, role, created_at",
    )
    .eq("role", "faculty")
    .order("created_at", {
      ascending: false,
    });

  if (profileError) {
    throw new Error(
      `Failed to load faculty profiles: ${profileError.message}`,
    );
  }

  const profileRows = profiles ?? [];
  const profileIds = profileRows.map(
    (profile) => profile.id,
  );

  let facultyRows: AdminRow[] = [];

  if (profileIds.length > 0) {
    const {
      data,
      error,
    } = await supabase
      .from("faculty")
      .select("*")
      .in("profile_id", profileIds);

    if (error) {
      throw new Error(
        `Failed to load faculty: ${error.message}`,
      );
    }

    facultyRows = (data ?? []) as AdminRow[];
  }

  const facultyByProfile = new Map(
    facultyRows.map((faculty) => [
      textValue(faculty, "profile_id", ""),
      faculty,
    ]),
  );

  return profileRows.map((profile) => {
    const faculty =
      facultyByProfile.get(profile.id) ?? {};

    return {
      id: profile.id,
      fullName:
        profile.full_name ?? "Unnamed Faculty",
      email: profile.email ?? "—",
      employeeId: textValue(
        faculty,
        "employee_id",
      ),
      departmentId: textValue(
        faculty,
        "department_id",
      ),
      createdAt: profile.created_at,
    };
  });
}

export async function getAdminSubjectsData() {
  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("subjects")
    .select("*")
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load subjects: ${error.message}`,
    );
  }

  return ((data ?? []) as AdminRow[]).map(
    (subject) => ({
      id: textValue(subject, "id", ""),
      name: textValue(subject, "name"),
      code: textValue(subject, "code"),
      credits: textValue(subject, "credits"),
      departmentId: textValue(
        subject,
        "department_id",
      ),
      programId: textValue(
        subject,
        "program_id",
      ),
      semesterId: textValue(
        subject,
        "semester_id",
      ),
    }),
  );
}

export async function getAdminDepartmentsData() {
  const supabase = await createClient();

  const {
    data,
    error,
  } = await supabase
    .from("departments")
    .select("*")
    .order("name", {
      ascending: true,
    });

  if (error) {
    throw new Error(
      `Failed to load departments: ${error.message}`,
    );
  }

  return ((data ?? []) as AdminRow[]).map(
    (department) => ({
      id: textValue(
        department,
        "id",
        "",
      ),
      name: textValue(
        department,
        "name",
      ),
      code: textValue(
        department,
        "code",
      ),
      description: textValue(
        department,
        "description",
      ),
    }),
  );
}
