import { createClient } from "@/lib/supabase/server";

import type {
  AcademicResource,
  ResourceSubject,
  ResourceUnit,
  ResourcesData,
  StudentNote,
} from "@/types/resources";

type ResourceRow = {
  id: string;
  subject_id: string | null;
  unit_id: string | null;
  uploaded_by: string | null;
  title: string;
  description: string | null;
  resource_type:
    | "pdf"
    | "image"
    | "document"
    | "link"
    | "note"
    | "pyq"
    | "other";
  storage_path: string | null;
  external_url: string | null;
  visibility:
    | "private"
    | "students"
    | "faculty"
    | "public";
  created_at: string;
};

type NoteRow = {
  id: string;
  subject_id: string | null;
  unit_id: string | null;
  title: string;
  content: string | null;
  created_at: string;
  updated_at: string;
};

type SubjectRow = {
  id: string;
  code: string;
  name: string;
};

type UnitRow = {
  id: string;
  subject_id: string;
  unit_number: number;
  title: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
};

export async function getResourcesData(): Promise<ResourcesData> {
  const supabase = await createClient();

  const [
    resourcesResult,
    notesResult,
    subjectsResult,
    unitsResult,
    profilesResult,
  ] = await Promise.all([
    supabase
      .from("resources")
      .select(
        `
          id,
          subject_id,
          unit_id,
          uploaded_by,
          title,
          description,
          resource_type,
          storage_path,
          external_url,
          visibility,
          created_at
        `,
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("notes")
      .select(
        `
          id,
          subject_id,
          unit_id,
          title,
          content,
          created_at,
          updated_at
        `,
      )
      .order("updated_at", { ascending: false }),

    supabase
      .from("subjects")
      .select("id, code, name")
      .order("code"),

    supabase
      .from("syllabus_units")
      .select("id, subject_id, unit_number, title")
      .order("subject_id")
      .order("unit_number"),

    supabase
      .from("profiles")
      .select("id, full_name"),
  ]);

  if (resourcesResult.error) {
    throw new Error(
      `Failed to load resources: ${resourcesResult.error.message}`,
    );
  }

  if (notesResult.error) {
    throw new Error(
      `Failed to load notes: ${notesResult.error.message}`,
    );
  }

  if (subjectsResult.error) {
    throw new Error(
      `Failed to load subjects: ${subjectsResult.error.message}`,
    );
  }

  if (unitsResult.error) {
    throw new Error(
      `Failed to load syllabus units: ${unitsResult.error.message}`,
    );
  }

  if (profilesResult.error) {
    throw new Error(
      `Failed to load profiles: ${profilesResult.error.message}`,
    );
  }

  const resources =
    (resourcesResult.data ?? []) as ResourceRow[];

  const notes =
    (notesResult.data ?? []) as NoteRow[];

  const subjects =
    (subjectsResult.data ?? []) as SubjectRow[];

  const units =
    (unitsResult.data ?? []) as UnitRow[];

  const profiles =
    (profilesResult.data ?? []) as ProfileRow[];

  const subjectMap = new Map<
    string,
    ResourceSubject
  >(
    subjects.map((subject) => [
      subject.id,
      {
        id: subject.id,
        code: subject.code,
        name: subject.name,
      },
    ]),
  );

  const unitMap = new Map<
    string,
    ResourceUnit
  >(
    units.map((unit) => [
      unit.id,
      {
        id: unit.id,
        subjectId: unit.subject_id,
        unitNumber: unit.unit_number,
        title: unit.title,
      },
    ]),
  );

  const profileMap = new Map<
    string,
    string | null
  >(
    profiles.map((profile) => [
      profile.id,
      profile.full_name,
    ]),
  );

  const resourcesWithUrls: AcademicResource[] =
    await Promise.all(
      resources.map(async (resource) => {
        let signedUrl: string | null = null;

        if (resource.storage_path) {
          const { data: signedUrlData } =
            await supabase.storage
              .from("resources")
              .createSignedUrl(
                resource.storage_path,
                60 * 30,
              );

          signedUrl =
            signedUrlData?.signedUrl ?? null;
        }

        return {
          id: resource.id,

          subjectId:
            resource.subject_id,

          unitId:
            resource.unit_id,

          uploadedBy:
            resource.uploaded_by,

          title:
            resource.title,

          description:
            resource.description,

          resourceType:
            resource.resource_type,

          storagePath:
            resource.storage_path,

          externalUrl:
            resource.external_url,

          visibility:
            resource.visibility,

          createdAt:
            resource.created_at,

          subject:
            resource.subject_id
              ? subjectMap.get(
                  resource.subject_id,
                ) ?? null
              : null,

          unit:
            resource.unit_id
              ? unitMap.get(
                  resource.unit_id,
                ) ?? null
              : null,

          uploaderName:
            resource.uploaded_by
              ? profileMap.get(
                  resource.uploaded_by,
                ) ?? null
              : null,

          signedUrl,
        };
      }),
    );

  const studentNotes: StudentNote[] =
    notes.map((note) => ({
      id: note.id,

      subjectId:
        note.subject_id,

      unitId:
        note.unit_id,

      title:
        note.title,

      content:
        note.content,

      createdAt:
        note.created_at,

      updatedAt:
        note.updated_at,

      subject:
        note.subject_id
          ? subjectMap.get(
              note.subject_id,
            ) ?? null
          : null,

      unit:
        note.unit_id
          ? unitMap.get(
              note.unit_id,
            ) ?? null
          : null,
    }));

  return {
    resources:
      resourcesWithUrls,

    notes:
      studentNotes,

    filters: {
      subjects:
        subjects.map((subject) => ({
          id: subject.id,
          code: subject.code,
          name: subject.name,
        })),

      units:
        units.map((unit) => ({
          id: unit.id,

          /*
           * Required so the resource and note
           * forms know which subject this unit
           * belongs to.
           */
          subjectId:
            unit.subject_id,

          unitNumber:
            unit.unit_number,

          title:
            unit.title,
        })),
    },
  };
}