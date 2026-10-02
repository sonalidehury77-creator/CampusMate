import { Card } from "@/components/ui/card";

import { createClient } from "@/lib/supabase/server";

import {
  getStudentAttendanceData,
} from "@/services/attendance/student-attendance-data";

function getStatusLabel(
  status: string,
): string {
  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
}

function getPercentageClass(
  percentage: number,
  required: number,
): string {
  if (
    percentage >= required
  ) {
    return "text-emerald-600";
  }

  if (
    percentage >=
    required - 5
  ) {
    return "text-amber-600";
  }

  return "text-red-600";
}

export default async function AttendancePage() {
  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
  } =
    await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const data =
    await getStudentAttendanceData(
      user.id,
    );

  const overall =
    data.overall;

  return (
    <div className="space-y-8">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div>
        <p className="text-sm font-semibold text-brand-600">
          Academic Intelligence
        </p>

        <h1 className="mt-2 text-3xl font-bold">
          Attendance Intelligence
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          Live attendance calculated from your recorded classes.
        </p>
      </div>

      {/* =====================================================
          OVERALL SUMMARY
      ====================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            Overall Attendance
          </p>

          <p
            className={`mt-2 text-3xl font-bold ${getPercentageClass(
              overall.percentage,
              overall.requiredPercentage,
            )}`}
          >
            {overall.percentage}%
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            Required:{" "}
            {overall.requiredPercentage}%
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            Attended
          </p>

          <p className="mt-2 text-3xl font-bold">
            {
              overall.attendedClasses
            }
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            out of{" "}
            {overall.countedClasses} counted classes
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            Absent
          </p>

          <p className="mt-2 text-3xl font-bold text-red-600">
            {
              overall.absentClasses
            }
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            Excused:{" "}
            {overall.excusedClasses}
          </p>
        </Card>

        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            Attendance Status
          </p>

          <p
            className={`mt-2 text-xl font-bold ${
              overall.isBelowRequired
                ? "text-red-600"
                : "text-emerald-600"
            }`}
          >
            {overall.isBelowRequired
              ? "Shortage"
              : "On Track"}
          </p>
        </Card>
      </div>

      {/* =====================================================
          REQUIRED CLASSES
      ====================================================== */}

      <Card className="p-6">
        <h2 className="text-xl font-semibold">
          Attendance Requirement
        </h2>

        <div className="mt-4">
          {overall.isBelowRequired ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="font-semibold text-red-700">
                Attendance shortage
              </p>

              <p className="mt-2 text-sm text-red-700">
                You need to attend the next{" "}
                <strong>
                  {
                    overall.classesRequiredToReachTarget
                  }
                </strong>{" "}
                counted classes consecutively to reach{" "}
                {
                  overall.requiredPercentage
                }
                %.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="font-semibold text-emerald-700">
                You are currently above the required attendance.
              </p>

              <p className="mt-2 text-sm text-emerald-700">
                You can miss approximately{" "}
                <strong>
                  {
                    overall.classesCanMiss
                  }
                </strong>{" "}
                more counted classes and remain at or above{" "}
                {
                  overall.requiredPercentage
                }%.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* =====================================================
          SUBJECT ATTENDANCE
      ====================================================== */}

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            Subject Attendance
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Each subject is calculated independently using its attendance policy.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {data.subjects.map(
            (subject) => (
              <Card
                key={
                  subject.subjectId
                }
                className="p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-brand-600">
                      {
                        subject.subjectCode
                      }
                    </p>

                    <h3 className="mt-1 font-semibold">
                      {
                        subject.subjectName
                      }
                    </h3>
                  </div>

                  <p
                    className={`text-2xl font-bold ${getPercentageClass(
                      subject.percentage,
                      subject.requiredPercentage,
                    )}`}
                  >
                    {
                      subject.percentage
                    }%
                  </p>
                </div>

                <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-slate-900"
                    style={{
                      width: `${Math.min(
                        subject.percentage,
                        100,
                      )}%`,
                    }}
                  />
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                  <div>
                    <p className="font-semibold">
                      {
                        subject.attendedClasses
                      }
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Attended
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold text-red-600">
                      {
                        subject.absentClasses
                      }
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Absent
                    </p>
                  </div>

                  <div>
                    <p className="font-semibold">
                      {
                        subject.countedClasses
                      }
                    </p>

                    <p className="text-xs text-muted-foreground">
                      Counted
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-xl bg-muted/50 p-4 text-sm">
                  {subject.isBelowRequired ? (
                    <p>
                      Attend the next{" "}
                      <strong>
                        {
                          subject.classesRequiredToReachTarget
                        }
                      </strong>{" "}
                      classes to reach{" "}
                      {
                        subject.requiredPercentage
                      }%.
                    </p>
                  ) : (
                    <p>
                      You can currently miss{" "}
                      <strong>
                        {
                          subject.classesCanMiss
                        }
                      </strong>{" "}
                      counted classes while staying at or above the requirement.
                    </p>
                  )}
                </div>
              </Card>
            ),
          )}

          {data.subjects.length ===
            0 && (
            <Card className="p-8 text-center text-sm text-muted-foreground">
              No enrolled subjects have attendance data yet.
            </Card>
          )}
        </div>
      </section>

      {/* =====================================================
          PREDICTION
      ====================================================== */}

      <Card className="p-6">
        <div>
          <p className="text-sm font-semibold text-brand-600">
            Attendance Forecast
          </p>

          <h2 className="mt-1 text-xl font-semibold">
            Where your attendance is heading
          </h2>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-3">
          <div>
            <p className="text-sm text-muted-foreground">
              Current
            </p>

            <p className="mt-1 text-2xl font-bold">
              {
                data.prediction.currentPercentage
              }%
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Recent attendance
            </p>

            <p className="mt-1 text-2xl font-bold">
              {
                data.prediction.recentAttendanceRate
              }%
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Projected
            </p>

            <p className="mt-1 text-2xl font-bold">
              {
                data.prediction.projectedPercentage
              }%
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-xl border p-5">
          <p className="text-sm">
            {
              data.prediction.explanation
            }
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            Projection uses recent attendance behaviour and scheduled timetable classes. It is a transparent projection, not a guaranteed outcome.
          </p>
        </div>
      </Card>

      {/* =====================================================
          MONTHLY TREND
      ====================================================== */}

      <Card className="p-6">
        <h2 className="text-xl font-semibold">
          Monthly Trend
        </h2>

        <div className="mt-5 space-y-4">
          {data.monthlyTrend.map(
            (month) => (
              <div
                key={
                  month.month
                }
              >
                <div className="flex justify-between text-sm">
                  <span>
                    {month.label}
                  </span>

                  <span className="font-semibold">
                    {
                      month.percentage
                    }%
                  </span>
                </div>

                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-slate-900"
                    style={{
                      width: `${Math.min(
                        month.percentage,
                        100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ),
          )}

          {data.monthlyTrend.length ===
            0 && (
            <p className="text-sm text-muted-foreground">
              Monthly attendance trend will appear after attendance records are available.
            </p>
          )}
        </div>
      </Card>

      {/* =====================================================
          ATTENDANCE CALENDAR
      ====================================================== */}

      <Card className="p-6">
        <h2 className="text-xl font-semibold">
          Attendance Calendar
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Recorded attendance by class date.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {data.calendar.map(
            (day, index) => (
              <div
                key={`${day.date}-${day.subjectCode}-${index}`}
                className="rounded-xl border p-4"
              >
                <p className="text-xs text-muted-foreground">
                  {day.date}
                </p>

                <p className="mt-1 font-medium">
                  {
                    day.subjectCode
                  }
                </p>

                <p
                  className={`mt-2 text-sm font-semibold ${
                    day.status ===
                    "present"
                      ? "text-emerald-600"
                      : day.status ===
                        "late"
                        ? "text-amber-600"
                        : day.status ===
                          "excused"
                          ? "text-blue-600"
                          : "text-red-600"
                  }`}
                >
                  {getStatusLabel(
                    day.status,
                  )}
                </p>
              </div>
            ),
          )}

          {data.calendar.length ===
            0 && (
            <p className="text-sm text-muted-foreground">
              No attendance calendar data available yet.
            </p>
          )}
        </div>
      </Card>

      {/* =====================================================
          RECENT RECORDS
      ====================================================== */}

      <Card className="overflow-hidden">
        <div className="border-b p-6">
          <h2 className="text-xl font-semibold">
            Recent Attendance
          </h2>
        </div>

        <div className="divide-y">
          {data.recentRecords.map(
            (record) => (
              <div
                key={
                  record.id
                }
                className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium">
                    {
                      record.subjectCode
                    }{" "}
                    —{" "}
                    {
                      record.subjectName
                    }
                  </p>

                  <p className="text-xs text-muted-foreground">
                    {
                      record.sessionDate
                    }
                  </p>
                </div>

                <p className="text-sm font-semibold">
                  {getStatusLabel(
                    record.status,
                  )}
                </p>
              </div>
            ),
          )}

          {data.recentRecords.length ===
            0 && (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No attendance records available.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}