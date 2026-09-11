import { Card } from "@/components/ui/card";

import type {
  AttendanceRecord,
} from "@/types/attendance";

type AttendanceListProps = {
  records: AttendanceRecord[];
};

function formatDate(
  date: string,
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeZone: "Asia/Kolkata",
    },
  ).format(
    new Date(
      `${date}T00:00:00+05:30`,
    ),
  );
}

function formatTime(
  time: string | null,
) {
  if (!time) {
    return "Time not assigned";
  }

  const [
    hours,
    minutes,
  ] = time
    .slice(0, 5)
    .split(":")
    .map(Number);

  const period =
    hours >= 12
      ? "PM"
      : "AM";

  const displayHours =
    hours % 12 === 0
      ? 12
      : hours % 12;

  return `${displayHours}:${String(
    minutes,
  ).padStart(2, "0")} ${period}`;
}

export function AttendanceList({
  records,
}: AttendanceListProps) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-medium text-brand-600">
          Attendance history
        </p>

        <h2 className="mt-1 text-xl font-semibold">
          Recent classes
        </h2>
      </div>

      {records.length === 0 ? (
        <Card>
          <p className="font-medium">
            No attendance records yet
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Attendance data will appear here
            when your classes are recorded.
          </p>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-muted">
                <tr className="border-b border-border text-left">
                  <th className="px-4 py-3 font-semibold">
                    Date
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Subject
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Time
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Room
                  </th>

                  <th className="px-4 py-3 font-semibold">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {records.map(
                  (record) => (
                    <tr
                      key={record.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="px-4 py-3">
                        {formatDate(
                          record.sessionDate,
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div>
                          <p className="font-medium">
                            {
                              record.subjectName
                            }
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {
                              record.subjectCode
                            }
                          </p>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {formatTime(
                          record.startTime,
                        )}
                        {" – "}
                        {formatTime(
                          record.endTime,
                        )}
                      </td>

                      <td className="px-4 py-3">
                        {record.room ??
                          "Not assigned"}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            record.status ===
                            "present"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {record.status ===
                          "present"
                            ? "Present"
                            : "Absent"}
                        </span>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}