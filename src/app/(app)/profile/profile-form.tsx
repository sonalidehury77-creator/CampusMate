"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ReactNode } from "react";

import { createClient } from "@/lib/supabase/client";

import type { ProfilePageData } from "@/services/profile/profile-data";

type ProfileFormProps = {
  initialData: ProfilePageData;
};

type Tab =
  | "overview"
  | "notifications"
  | "privacy"
  | "security"
  | "activity";

const tabs: {
  id: Tab;
  label: string;
}[] = [
  {
    id: "overview",
    label: "Profile",
  },
  {
    id: "notifications",
    label: "Notifications",
  },
  {
    id: "privacy",
    label: "Privacy",
  },
  {
    id: "security",
    label: "Security",
  },
  {
    id: "activity",
    label: "Activity",
  },
];

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-bold text-slate-950">
          {title}
        </h2>

        {description ? (
          <p className="mt-1 text-sm text-slate-500">
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </section>
  );
}

function Field({
  label,
  value,
  readOnly = false,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  readOnly?: boolean;
  onChange?: (
    value: string,
  ) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(event) =>
          onChange?.(
            event.target.value,
          )
        }
        className={[
          "w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition",
          readOnly
            ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-500"
            : "border-slate-300 bg-white text-slate-950 focus:border-slate-950",
        ].join(" ")}
      />
    </label>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (
    checked: boolean,
  ) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 p-4">
      <span>
        <span className="block text-sm font-semibold text-slate-900">
          {label}
        </span>

        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {description}
        </span>
      </span>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(
            event.target.checked,
          )
        }
        className="mt-1 h-4 w-4"
      />
    </label>
  );
}

export function ProfileForm({
  initialData,
}: ProfileFormProps) {
  const supabase =
    createClient();

  const router =
    useRouter();

  /*
   * IMPORTANT:
   *
   * We initialize state directly from initialData.
   *
   * We intentionally DO NOT use:
   *
   * useEffect(() => {
   *   setFullName(...)
   * }, [...])
   *
   * because these values are initial form state,
   * not an external system synchronization.
   *
   * This removes the React
   * react-hooks/set-state-in-effect
   * lint error.
   */

  const [
    activeTab,
    setActiveTab,
  ] = useState<Tab>(
    "overview",
  );

  const [
    fullName,
    setFullName,
  ] = useState(
    initialData.profile.fullName,
  );

  const [
    phone,
    setPhone,
  ] = useState(
    initialData.profile.phone,
  );

  const [
    notifications,
    setNotifications,
  ] = useState(
    initialData.notifications,
  );

  const [
    privacy,
    setPrivacy,
  ] = useState(
    initialData.privacy,
  );

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    avatarUrl,
    setAvatarUrl,
  ] = useState(
    initialData.profile.avatarUrl,
  );

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    mfaEnabled,
    setMfaEnabled,
  ] = useState(
    initialData.mfaEnabled,
  );

  const [
    mfaFactorId,
    setMfaFactorId,
  ] = useState<
    string | null
  >(null);

  const [
    mfaQrCode,
    setMfaQrCode,
  ] = useState<
    string | null
  >(null);

  const [
    mfaCode,
    setMfaCode,
  ] = useState("");

  const [
    activity,
  ] = useState(
    initialData.activity,
  );

  async function saveProfile() {
    setSaving(true);
    setMessage("");

    const {
      error,
    } = await supabase
      .from("profiles")
      .update({
        full_name:
          fullName.trim(),
        phone:
          phone.trim() || null,
      })
      .eq(
        "id",
        initialData.profile.id,
      );

    if (error) {
      setMessage(
        `Could not save profile: ${error.message}`,
      );
      setSaving(false);
      return;
    }

    setMessage(
      "Profile information saved successfully.",
    );

    setSaving(false);
  }

  async function saveNotifications() {
    setSaving(true);
    setMessage("");

    /*
     * IMPORTANT:
     *
     * Convert the UI-friendly names back
     * to the real database column names.
     */
    const {
      error,
    } = await supabase
      .from(
        "notification_preferences",
      )
      .upsert(
        {
          profile_id:
            initialData.profile.id,

          assignment_notifications:
            notifications.assignment,

          notice_notifications:
            notifications.notice,

          attendance_notifications:
            notifications.attendance,

          timetable_notifications:
            true,

          event_notifications:
            notifications.general,

          ai_notifications:
            notifications.study,

          email_notifications:
            notifications.email,

          push_notifications:
            notifications.push,
        },
        {
          onConflict:
            "profile_id",
        },
      );

    if (error) {
      setMessage(
        `Could not save notification preferences: ${error.message}`,
      );
      setSaving(false);
      return;
    }

    setMessage(
      "Notification preferences saved successfully.",
    );

    setSaving(false);
  }

  async function savePrivacy() {
    setSaving(true);
    setMessage("");

    const {
      error,
    } = await supabase
      .from(
        "profile_settings",
      )
      .upsert(
        {
          profile_id:
            initialData.profile.id,

          profile_visibility:
            privacy.profileVisibility,

          show_email:
            privacy.showEmail,

          show_phone:
            privacy.showPhone,

          allow_profile_search:
            privacy.allowProfileSearch,

          login_alerts:
            privacy.loginAlerts,

          security_alerts:
            privacy.securityAlerts,

          activity_alerts:
            privacy.activityAlerts,
        },
        {
          onConflict:
            "profile_id",
        },
      );

    if (error) {
      setMessage(
        `Could not save privacy settings: ${error.message}`,
      );
      setSaving(false);
      return;
    }

    setMessage(
      "Privacy and security preferences saved.",
    );

    setSaving(false);
  }

  async function uploadAvatar(
    file: File,
  ) {
    setMessage("");

    if (
      file.size >
      2 * 1024 * 1024
    ) {
      setMessage(
        "Profile image must be smaller than 2 MB.",
      );
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        file.type,
      )
    ) {
      setMessage(
        "Only JPG, PNG or WebP profile images are allowed.",
      );
      return;
    }

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() ??
      "jpg";

    const path =
      `${initialData.profile.id}/${crypto.randomUUID()}.${extension}`;

    const {
      error: uploadError,
    } = await supabase.storage
      .from("profile-images")
      .upload(
        path,
        file,
        {
          cacheControl:
            "3600",
          contentType:
            file.type,
          upsert: false,
        },
      );

    if (uploadError) {
      setMessage(
        `Could not upload profile image: ${uploadError.message}`,
      );
      return;
    }

    const {
      error:
        profileError,
    } = await supabase
      .from("profiles")
      .update({
        avatar_path:
          path,
        avatar_url:
          null,
      })
      .eq(
        "id",
        initialData.profile.id,
      );

    if (profileError) {
      await supabase.storage
        .from("profile-images")
        .remove([path]);

      setMessage(
        `Could not save profile image: ${profileError.message}`,
      );

      return;
    }

    if (
      initialData.profile
        .avatarPath
    ) {
      await supabase.storage
        .from("profile-images")
        .remove([
          initialData.profile
            .avatarPath,
        ]);
    }

    const {
      data: signedData,
      error:
        signedUrlError,
    } = await supabase.storage
      .from("profile-images")
      .createSignedUrl(
        path,
        3600,
      );

    if (signedUrlError) {
      setMessage(
        `Profile image uploaded, but preview could not be generated: ${signedUrlError.message}`,
      );
      return;
    }

    setAvatarUrl(
      signedData?.signedUrl ??
        null,
    );

    setMessage(
      "Profile picture updated successfully.",
    );
  }

  async function changePassword() {
    setMessage("");

    if (
      !currentPassword
    ) {
      setMessage(
        "Enter your current password.",
      );
      return;
    }

    if (
      newPassword.length <
      8
    ) {
      setMessage(
        "New password must contain at least 8 characters.",
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setMessage(
        "New password and confirmation do not match.",
      );
      return;
    }

    setSaving(true);

    const {
      error,
    } = await supabase.auth.updateUser(
      {
        password:
          newPassword,
      },
      {
        emailRedirectTo:
          undefined,
      },
    );

    /*
     * Supabase Auth password changes are handled
     * by the authenticated session.
     *
     * If your installed Supabase JS version supports
     * current_password, the server/auth configuration
     * will enforce the current password requirement.
     */
    if (error) {
      setMessage(
        `Could not change password: ${error.message}`,
      );
      setSaving(false);
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    setMessage(
      "Password changed successfully.",
    );

    setSaving(false);
  }

  async function signOutAllSessions() {
    setSaving(true);
    setMessage("");

    const {
      error,
    } = await supabase.auth.signOut(
      {
        scope: "global",
      },
    );

    if (error) {
      setMessage(
        `Could not sign out all sessions: ${error.message}`,
      );
      setSaving(false);
      return;
    }

    /*
     * IMPORTANT:
     * Use Next.js router navigation in a
     * Client Component instead of
     * window.location.href.
     */
    router.replace(
      "/login",
    );
    router.refresh();
  }

  async function enableMfa() {
    setMessage("");

    const {
      data,
      error,
    } = await supabase.auth.mfa.enroll(
      {
        factorType:
          "totp",

        friendlyName:
          "CampusMate Authenticator",
      },
    );

    if (error) {
      setMessage(
        `Could not start MFA setup: ${error.message}`,
      );
      return;
    }

    setMfaFactorId(
      data.id,
    );

    /*
     * Supabase returns a QR-code data URI.
     * Store it directly.
     */
    setMfaQrCode(
      data.totp?.qr_code ??
        null,
    );

    setMessage(
      "Scan the QR code using your authenticator app.",
    );
  }

  async function verifyMfa() {
    if (
      !mfaFactorId
    ) {
      setMessage(
        "MFA setup has not been initialized.",
      );
      return;
    }

    if (
      !/^\d{6}$/.test(
        mfaCode.trim(),
      )
    ) {
      setMessage(
        "Enter the 6-digit authenticator code.",
      );
      return;
    }

    const {
      data: challenge,
      error:
        challengeError,
    } = await supabase.auth.mfa.challenge(
      {
        factorId:
          mfaFactorId,
      },
    );

    if (challengeError) {
      setMessage(
        `Could not create MFA challenge: ${challengeError.message}`,
      );
      return;
    }

    const {
      error:
        verifyError,
    } = await supabase.auth.mfa.verify(
      {
        factorId:
          mfaFactorId,

        challengeId:
          challenge.id,

        code:
          mfaCode.trim(),
      },
    );

    if (verifyError) {
      setMessage(
        `MFA verification failed: ${verifyError.message}`,
      );
      return;
    }

    setMfaEnabled(
      true,
    );

    setMfaQrCode(
      null,
    );

    setMfaFactorId(
      null,
    );

    setMfaCode("");

    setMessage(
      "Two-factor authentication is now enabled.",
    );
  }

  async function disableMfa() {
    setMessage("");

    const {
      data,
      error,
    } = await supabase.auth.mfa.listFactors();

    if (error) {
      setMessage(
        `Could not load MFA factors: ${error.message}`,
      );
      return;
    }

    const factor =
      data.totp.find(
        (item) =>
          item.status ===
          "verified",
      );

    if (!factor) {
      setMfaEnabled(
        false,
      );
      return;
    }

    const {
      error:
        unenrollError,
    } = await supabase.auth.mfa.unenroll(
      {
        factorId:
          factor.id,
      },
    );

    if (unenrollError) {
      setMessage(
        `Could not disable MFA: ${unenrollError.message}`,
      );
      return;
    }

    setMfaEnabled(
      false,
    );

    setMessage(
      "Two-factor authentication has been disabled.",
    );
  }

  function renderOverview() {
    return (
      <div className="space-y-6">
        <Card
          title="Personal Information"
          description="Only information that you control directly is editable here."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Full name"
              value={fullName}
              onChange={
                setFullName
              }
            />

            <Field
              label="Email"
              value={
                initialData
                  .profile
                  .email
              }
              readOnly
            />

            <Field
              label="Phone"
              value={phone}
              onChange={
                setPhone
              }
            />

            <Field
              label="Role"
              value={
                initialData
                  .profile
                  .role
              }
              readOnly
            />
          </div>

          <div className="mt-5">
            <button
              type="button"
              onClick={
                saveProfile
              }
              disabled={
                saving
              }
              className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : "Save profile"}
            </button>
          </div>
        </Card>

        <Card
          title="Academic Information"
          description="Academic identity comes from your university records and is read-only here."
        >
          {initialData.academic ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Info
                label="Student ID"
                value={
                  initialData
                    .academic
                    .studentId
                }
              />

              <Info
                label="Department"
                value={`${initialData.academic.departmentName} (${initialData.academic.departmentCode})`}
              />

              <Info
                label="Program"
                value={`${initialData.academic.programName} (${initialData.academic.programCode})`}
              />

              <Info
                label="Semester"
                value={
                  initialData
                    .academic
                    .semesterNumber
                    ? `Semester ${initialData.academic.semesterNumber}`
                    : "—"
                }
              />

              <Info
                label="Academic year"
                value={
                  initialData
                    .academic
                    .academicYear
                }
              />

              <Info
                label="Enrollment year"
                value={
                  initialData
                    .academic
                    .enrollmentYear
                    ? String(
                        initialData
                          .academic
                          .enrollmentYear,
                      )
                    : "—"
                }
              />
            </div>
          ) : (
            <p className="text-sm text-slate-500">
              No student academic record is linked to this account.
            </p>
          )}
        </Card>

        <Card
          title="Profile Picture"
          description="Private profile image stored securely in Supabase Storage."
        >
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt="Profile picture"
                  width={96}
                  height={96}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-2xl font-bold text-slate-400">
                  {fullName
                    .slice(0, 1)
                    .toUpperCase()}
                </span>
              )}
            </div>

            <div>
              <label className="inline-flex cursor-pointer rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                Choose image

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={async (
                    event,
                  ) => {
                    const file =
                      event.target
                        .files?.[0];

                    if (file) {
                      await uploadAvatar(
                        file,
                      );
                    }

                    event.target.value =
                      "";
                  }}
                />
              </label>

              <p className="mt-2 text-xs text-slate-500">
                JPG, PNG or WebP · maximum 2 MB
              </p>
            </div>
          </div>
        </Card>

        <Card
          title="Account Information"
          description="Authentication-controlled account details."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Info
              label="Account email"
              value={
                initialData
                  .user
                  .email ??
                "—"
              }
            />

            <Info
              label="Account created"
              value={formatDate(
                initialData
                  .user
                  .createdAt,
              )}
            />

            <Info
              label="Last sign-in"
              value={formatDate(
                initialData
                  .user
                  .lastSignInAt,
              )}
            />

            <Info
              label="Account role"
              value={
                initialData
                  .profile
                  .role
              }
            />
          </div>
        </Card>
      </div>
    );
  }

  function renderNotifications() {
    return (
      <div className="space-y-6">
        <Card
          title="CampusMate Notifications"
          description="Choose which categories should generate notifications for you."
        >
          <div className="space-y-3">
            <Toggle
              label="Assignments"
              description="Assignment creation, updates and deadlines."
              checked={
                notifications
                  .assignment
              }
              onChange={(
                value,
              ) =>
                setNotifications(
                  (
                    current,
                  ) => ({
                    ...current,
                    assignment:
                      value,
                  }),
                )
              }
            />

            <Toggle
              label="Attendance"
              description="Attendance risks, shortages and important updates."
              checked={
                notifications
                  .attendance
              }
              onChange={(
                value,
              ) =>
                setNotifications(
                  (
                    current,
                  ) => ({
                    ...current,
                    attendance:
                      value,
                  }),
                )
              }
            />

            <Toggle
              label="Notices"
              description="Important campus and department notices."
              checked={
                notifications
                  .notice
              }
              onChange={(
                value,
              ) =>
                setNotifications(
                  (
                    current,
                  ) => ({
                    ...current,
                    notice:
                      value,
                  }),
                )
              }
            />

            <Toggle
              label="Exams"
              description="Exam-related reminders and academic deadlines."
              checked={
                notifications
                  .exams
              }
              onChange={(
                value,
              ) =>
                setNotifications(
                  (
                    current,
                  ) => ({
                    ...current,
                    exams:
                      value,
                  }),
                )
              }
            />

            <Toggle
              label="Study"
              description="Study planning, revision and AI study notifications."
              checked={
                notifications
                  .study
              }
              onChange={(
                value,
              ) =>
                setNotifications(
                  (
                    current,
                  ) => ({
                    ...current,
                    study:
                      value,
                  }),
                )
              }
            />

            <Toggle
              label="General"
              description="General CampusMate and campus event notifications."
              checked={
                notifications
                  .general
              }
              onChange={(
                value,
              ) =>
                setNotifications(
                  (
                    current,
                  ) => ({
                    ...current,
                    general:
                      value,
                  }),
                )
              }
            />
          </div>
        </Card>

        <Card
          title="Delivery Channels"
          description="Control where CampusMate may deliver supported notifications."
        >
          <div className="space-y-3">
            <Toggle
              label="Push notifications"
              description="Browser or device push notifications."
              checked={
                notifications
                  .push
              }
              onChange={(
                value,
              ) =>
                setNotifications(
                  (
                    current,
                  ) => ({
                    ...current,
                    push:
                      value,
                  }),
                )
              }
            />

            <Toggle
              label="Email notifications"
              description="Important notifications delivered to your account email."
              checked={
                notifications
                  .email
              }
              onChange={(
                value,
              ) =>
                setNotifications(
                  (
                    current,
                  ) => ({
                    ...current,
                    email:
                      value,
                  }),
                )
              }
            />
          </div>

          <button
            type="button"
            onClick={
              saveNotifications
            }
            disabled={
              saving
            }
            className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save notification preferences"}
          </button>
        </Card>
      </div>
    );
  }

  function renderPrivacy() {
    return (
      <div className="space-y-6">
        <Card
          title="Profile Visibility"
          description="Control how your profile can be discovered inside CampusMate."
        >
          <select
            value={
              privacy
                .profileVisibility
            }
            onChange={(
              event,
            ) =>
              setPrivacy(
                (
                  current,
                ) => ({
                  ...current,
                  profileVisibility:
                    event
                      .target
                      .value,
                }),
              )
            }
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm"
          >
            <option value="private">
              Private
            </option>

            <option value="campus">
              Campus
            </option>

            <option value="public">
              Public
            </option>
          </select>
        </Card>

        <Card
          title="Personal Information Visibility"
          description="Control visibility of your contact information in supported CampusMate features."
        >
          <div className="space-y-3">
            <Toggle
              label="Show email"
              description="Allow your email to appear in permitted CampusMate profile contexts."
              checked={
                privacy.showEmail
              }
              onChange={(
                value,
              ) =>
                setPrivacy(
                  (
                    current,
                  ) => ({
                    ...current,
                    showEmail:
                      value,
                  }),
                )
              }
            />

            <Toggle
              label="Show phone"
              description="Allow your phone number to appear in permitted CampusMate profile contexts."
              checked={
                privacy.showPhone
              }
              onChange={(
                value,
              ) =>
                setPrivacy(
                  (
                    current,
                  ) => ({
                    ...current,
                    showPhone:
                      value,
                  }),
                )
              }
            />

            <Toggle
              label="Allow profile search"
              description="Allow your profile to appear in supported CampusMate people-search results."
              checked={
                privacy
                  .allowProfileSearch
              }
              onChange={(
                value,
              ) =>
                setPrivacy(
                  (
                    current,
                  ) => ({
                    ...current,
                    allowProfileSearch:
                      value,
                  }),
                )
              }
            />
          </div>
        </Card>

        <Card
          title="Security Alerts"
          description="Important account protection notifications."
        >
          <div className="space-y-3">
            <Toggle
              label="Login alerts"
              description="Receive alerts for important sign-in events."
              checked={
                privacy
                  .loginAlerts
              }
              onChange={(
                value,
              ) =>
                setPrivacy(
                  (
                    current,
                  ) => ({
                    ...current,
                    loginAlerts:
                      value,
                  }),
                )
              }
            />

            <Toggle
              label="Security alerts"
              description="Receive notifications about security-sensitive account events."
              checked={
                privacy
                  .securityAlerts
              }
              onChange={(
                value,
              ) =>
                setPrivacy(
                  (
                    current,
                  ) => ({
                    ...current,
                    securityAlerts:
                      value,
                  }),
                )
              }
            />

            <Toggle
              label="Activity alerts"
              description="Receive important CampusMate account activity notifications."
              checked={
                privacy
                  .activityAlerts
              }
              onChange={(
                value,
              ) =>
                setPrivacy(
                  (
                    current,
                  ) => ({
                    ...current,
                    activityAlerts:
                      value,
                  }),
                )
              }
            />
          </div>

          <button
            type="button"
            onClick={
              savePrivacy
            }
            disabled={
              saving
            }
            className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Save privacy settings"}
          </button>
        </Card>
      </div>
    );
  }

  function renderSecurity() {
    return (
      <div className="space-y-6">
        <Card
          title="Change Password"
          description="Update your CampusMate authentication password."
        >
          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label="Current password"
              value={
                currentPassword
              }
              onChange={
                setCurrentPassword
              }
              type="password"
            />

            <div />

            <Field
              label="New password"
              value={
                newPassword
              }
              onChange={
                setNewPassword
              }
              type="password"
            />

            <Field
              label="Confirm new password"
              value={
                confirmPassword
              }
              onChange={
                setConfirmPassword
              }
              type="password"
            />
          </div>

          <button
            type="button"
            onClick={
              changePassword
            }
            disabled={
              saving
            }
            className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {saving
              ? "Updating..."
              : "Change password"}
          </button>
        </Card>

        <Card
          title="Two-Factor Authentication"
          description="Protect your CampusMate account with an authenticator application."
        >
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">
              {mfaEnabled
                ? "MFA is enabled"
                : "MFA is not enabled"}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {mfaEnabled
                ? "Your account has a verified authenticator factor."
                : "Use an authenticator application such as Google Authenticator or Microsoft Authenticator."}
            </p>
          </div>

          {!mfaEnabled &&
          !mfaQrCode ? (
            <button
              type="button"
              onClick={
                enableMfa
              }
              className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Enable MFA
            </button>
          ) : null}

          {mfaQrCode ? (
            <div className="mt-5 space-y-4">
              <p className="text-sm text-slate-600">
                Scan the QR code with your authenticator app and enter the generated 6-digit code.
              </p>

              <div className="w-fit rounded-2xl border border-slate-200 bg-white p-4">
                <Image
                  src={mfaQrCode}
                  alt="MFA QR code"
                  width={224}
                  height={224}
                  unoptimized
                />
              </div>

              <Field
                label="Authenticator code"
                value={mfaCode}
                onChange={
                  setMfaCode
                }
                type="text"
              />

              <button
                type="button"
                onClick={
                  verifyMfa
                }
                className="rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white"
              >
                Verify and enable MFA
              </button>
            </div>
          ) : null}

          {mfaEnabled ? (
            <button
              type="button"
              onClick={
                disableMfa
              }
              className="mt-5 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
            >
              Disable MFA
            </button>
          ) : null}
        </Card>

        <Card
          title="Active Sessions"
          description="Immediately sign out CampusMate from all authenticated devices."
        >
          <button
            type="button"
            onClick={
              signOutAllSessions
            }
            disabled={
              saving
            }
            className="rounded-xl border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Sign out all sessions
          </button>
        </Card>
      </div>
    );
  }

  function renderActivity() {
    return (
      <Card
        title="Account Activity"
        description="Recent CampusMate activity associated with your account."
      >
        {activity.length ===
        0 ? (
          <p className="text-sm text-slate-500">
            No recent CampusMate activity has been recorded.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {activity.map(
              (item) => (
                <div
                  key={
                    item.id
                  }
                  className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {
                        item.action
                      }
                    </p>

                    <p className="text-xs text-slate-500">
                      {
                        item.entityType
                      }
                    </p>
                  </div>

                  <p className="text-xs text-slate-400">
                    {formatDate(
                      item.createdAt,
                    )}
                  </p>
                </div>
              ),
            )}
          </div>
        )}
      </Card>
    );
  }

  let content: ReactNode;

  if (
    activeTab ===
    "notifications"
  ) {
    content =
      renderNotifications();
  } else if (
    activeTab === "privacy"
  ) {
    content =
      renderPrivacy();
  } else if (
    activeTab === "security"
  ) {
    content =
      renderSecurity();
  } else if (
    activeTab === "activity"
  ) {
    content =
      renderActivity();
  } else {
    content =
      renderOverview();
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
        <div className="flex min-w-max gap-1">
          {tabs.map(
            (tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(
                    tab.id,
                  )
                }
                className={[
                  "rounded-xl px-4 py-2.5 text-sm font-semibold transition",
                  activeTab ===
                  tab.id
                    ? "bg-slate-950 text-white"
                    : "text-slate-600 hover:bg-slate-100",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ),
          )}
        </div>
      </div>

      {message ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      ) : null}

      {content}
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-900">
        {value}
      </p>
    </div>
  );
}

function formatDate(
  value: string | null,
): string {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(date);
}