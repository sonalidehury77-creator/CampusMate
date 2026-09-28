import { getFacultyDashboardData } from "@/services/faculty/faculty-data";
import { requireFaculty } from "@/lib/auth/require-faculty";
export default async function FacultyTimetablePage() {
    await requireFaculty();

  const data =
    await getFacultyDashboardData();

  const grouped =
    data.upcomingClasses.reduce<
      Record<string, typeof data.upcomingClasses>
    >(
      (result, item) => {
        if (!result[item.dayOfWeek]) {
          result[item.dayOfWeek] = [];
        }

        result[item.dayOfWeek].push(
          item,
        );

        return result;
      },
      {},
    );

  return (
    <main className="space-y-8">
      <section>
        <p className="text-sm font-medium text-indigo-600">
          Faculty Portal
        </p>

        <h1 className="mt-1 text-3xl font-bold text-slate-950">
          Teaching Timetable
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Your classes, rooms and teaching schedule.
        </p>
      </section>

      <section className="space-y-5">
        {Object.entries(grouped).map(
          ([day, classes]) => (
            <div
              key={day}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-lg font-bold text-slate-950">
                {day}
              </h2>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {classes.map(
                  (item) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-slate-50 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-bold text-slate-950">
                            {
                              item.subjectCode
                            }
                          </p>

                          <p className="mt-1 text-sm text-slate-600">
                            {
                              item.subjectName
                            }
                          </p>
                        </div>

                        <span className="rounded-lg bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          {
                            item.startTime
                          }{" "}
                          –{" "}
                          {
                            item.endTime
                          }
                        </span>
                      </div>

                      <p className="mt-4 text-xs text-slate-500">
                        Room{" "}
                        {item.room ??
                          "Not assigned"}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>
          ),
        )}

        {Object.keys(grouped).length ===
          0 && (
          <div className="rounded-2xl bg-slate-50 p-8 text-sm text-slate-500">
            No timetable entries are assigned to this faculty profile.
          </div>
        )}
      </section>
    </main>
  );
}