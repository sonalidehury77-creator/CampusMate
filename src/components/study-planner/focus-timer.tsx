"use client";

import { useEffect, useMemo, useState } from "react";

type FocusTimerProps = {
  defaultMinutes?: number;
  onComplete?: (durationMinutes: number) => void;
};

export function FocusTimer({
  defaultMinutes = 25,
  onComplete,
}: FocusTimerProps) {
  const [minutes, setMinutes] =
    useState(defaultMinutes);

  const [secondsRemaining, setSecondsRemaining] =
    useState(defaultMinutes * 60);

  const [running, setRunning] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  useEffect(() => {
    if (!running) {
      return;
    }

    const interval = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(interval);

          setRunning(false);
          setCompleted(true);

          onComplete?.(minutes);

          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [running, minutes, onComplete]);

  const formattedTime = useMemo(() => {
    const remainingMinutes =
      Math.floor(secondsRemaining / 60);

    const remainingSeconds =
      secondsRemaining % 60;

    return `${String(
      remainingMinutes,
    ).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  }, [secondsRemaining]);

  function resetTimer() {
    setRunning(false);
    setCompleted(false);
    setSecondsRemaining(
      minutes * 60,
    );
  }

  function changeDuration(
    value: number,
  ) {
    setMinutes(value);
    setRunning(false);
    setCompleted(false);
    setSecondsRemaining(value * 60);
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="text-center">
        <p className="text-sm font-medium text-brand-600">
          Focus Mode
        </p>

        <h2 className="mt-2 text-5xl font-bold tracking-tight">
          {formattedTime}
        </h2>

        <p className="mt-3 text-sm text-muted-foreground">
          {completed
            ? "Great work. Focus session completed."
            : running
              ? "Stay focused."
              : "Ready when you are."}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {[15, 25, 45, 60].map(
            (duration) => (
              <button
                key={duration}
                type="button"
                onClick={() =>
                  changeDuration(duration)
                }
                className={`rounded-lg border px-3 py-2 text-sm ${
                  minutes === duration
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:bg-muted"
                }`}
              >
                {duration} min
              </button>
            ),
          )}
        </div>

        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() =>
              setRunning((value) => !value)
            }
            disabled={secondsRemaining === 0}
            className="rounded-lg bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-50"
          >
            {running ? "Pause" : "Start"}
          </button>

          <button
            type="button"
            onClick={resetTimer}
            className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}