"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { createClient } from "@/lib/supabase/server";

const noteSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Note title is required.")
    .max(120, "Note title is too long."),

  content: z
    .string()
    .trim()
    .max(10000, "Note content is too long."),

  subjectId: z
    .string()
    .uuid()
    .nullable(),

  unitId: z
    .string()
    .uuid()
    .nullable(),
});

const resourceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Resource title is required.")
    .max(160, "Resource title is too long."),

  description: z
    .string()
    .trim()
    .max(1000, "Description is too long."),

  subjectId: z
    .string()
    .uuid()
    .nullable(),

  unitId: z
    .string()
    .uuid()
    .nullable(),

  resourceType: z.enum([
    "pdf",
    "image",
    "document",
    "link",
    "note",
    "pyq",
    "other",
  ]),

  storagePath: z
    .string()
    .trim()
    .max(500)
    .nullable(),

  externalUrl: z
    .string()
    .trim()
    .max(2000)
    .nullable(),

  visibility: z.enum([
    "private",
    "students",
    "faculty",
    "public",
  ]),
});

function nullableValue(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export async function createNote(
  formData: FormData,
) {
  const supabase = await createClient();

  const { data: userData } =
    await supabase.auth.getUser();

  const user = userData.user;

  if (!user) {
    return {
      success: false,
      message: "You must be signed in.",
    };
  }

  const { data: student, error: studentError } =
    await supabase
      .from("students")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle();

  if (studentError || !student) {
    return {
      success: false,
      message: "Student profile could not be found.",
    };
  }

  const validation = noteSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content") ?? "",
    subjectId: nullableValue(
      formData.get("subjectId"),
    ),
    unitId: nullableValue(
      formData.get("unitId"),
    ),
  });

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.issues[0]?.message ??
        "Invalid note data.",
    };
  }

  const { error } = await supabase
    .from("notes")
    .insert({
      student_id: student.id,
      subject_id: validation.data.subjectId,
      unit_id: validation.data.unitId,
      title: validation.data.title,
      content: validation.data.content || null,
    });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/resources");

  return {
    success: true,
    message: "Note created successfully.",
  };
}


export async function updateNote(
  noteId: string,
  formData: FormData,
) {
  const supabase = await createClient();

  const { data: userData } =
    await supabase.auth.getUser();

  if (!userData.user) {
    return {
      success: false,
      message: "You must be signed in.",
    };
  }

  const idValidation = z
    .uuid()
    .safeParse(noteId);

  if (!idValidation.success) {
    return {
      success: false,
      message: "Invalid note ID.",
    };
  }

  const validation = noteSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content") ?? "",
    subjectId: nullableValue(
      formData.get("subjectId"),
    ),
    unitId: nullableValue(
      formData.get("unitId"),
    ),
  });

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.issues[0]?.message ??
        "Invalid note data.",
    };
  }

  const { error } = await supabase
    .from("notes")
    .update({
      subject_id: validation.data.subjectId,
      unit_id: validation.data.unitId,
      title: validation.data.title,
      content: validation.data.content || null,
    })
    .eq("id", noteId);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/resources");

  return {
    success: true,
    message: "Note updated successfully.",
  };
}


export async function deleteNote(
  noteId: string,
) {
  const supabase = await createClient();

  const { data: userData } =
    await supabase.auth.getUser();

  if (!userData.user) {
    return {
      success: false,
      message: "You must be signed in.",
    };
  }

  const validation = z
    .uuid()
    .safeParse(noteId);

  if (!validation.success) {
    return {
      success: false,
      message: "Invalid note ID.",
    };
  }

  const { error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId);

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/resources");

  return {
    success: true,
    message: "Note deleted successfully.",
  };
}


export async function createResource(
  formData: FormData,
) {
  const supabase = await createClient();

  const { data: userData } =
    await supabase.auth.getUser();

  const user = userData.user;

  if (!user) {
    return {
      success: false,
      message: "You must be signed in.",
    };
  }

  const rawExternalUrl =
    nullableValue(formData.get("externalUrl"));

  if (rawExternalUrl) {
    const urlValidation = z
      .httpUrl()
      .safeParse(rawExternalUrl);

    if (!urlValidation.success) {
      return {
        success: false,
        message:
          "Please enter a valid HTTP or HTTPS URL.",
      };
    }
  }

  const validation = resourceSchema.safeParse({
    title: formData.get("title"),
    description:
      formData.get("description") ?? "",
    subjectId: nullableValue(
      formData.get("subjectId"),
    ),
    unitId: nullableValue(
      formData.get("unitId"),
    ),
    resourceType:
      formData.get("resourceType"),
    storagePath: nullableValue(
      formData.get("storagePath"),
    ),
    externalUrl: rawExternalUrl,
    visibility:
      formData.get("visibility"),
  });

  if (!validation.success) {
    return {
      success: false,
      message:
        validation.error.issues[0]?.message ??
        "Invalid resource data.",
    };
  }

  if (
    !validation.data.storagePath &&
    !validation.data.externalUrl
  ) {
    return {
      success: false,
      message:
        "A file or external URL is required.",
    };
  }

  const { error } = await supabase
    .from("resources")
    .insert({
      subject_id: validation.data.subjectId,
      unit_id: validation.data.unitId,
      uploaded_by: user.id,
      title: validation.data.title,
      description:
        validation.data.description || null,
      resource_type:
        validation.data.resourceType,
      storage_path:
        validation.data.storagePath,
      external_url:
        validation.data.externalUrl,
      visibility:
        validation.data.visibility,
    });

  if (error) {
    return {
      success: false,
      message: error.message,
    };
  }

  revalidatePath("/resources");

  return {
    success: true,
    message: "Resource added successfully.",
  };
}


export async function deleteResource(
  resourceId: string,
) {
  const supabase = await createClient();

  const { data: userData } =
    await supabase.auth.getUser();

  if (!userData.user) {
    return {
      success: false,
      message: "You must be signed in.",
    };
  }

  const validation = z
    .uuid()
    .safeParse(resourceId);

  if (!validation.success) {
    return {
      success: false,
      message: "Invalid resource ID.",
    };
  }

  const { data: resource, error: fetchError } =
    await supabase
      .from("resources")
      .select("id, storage_path")
      .eq("id", resourceId)
      .maybeSingle();

  if (fetchError || !resource) {
    return {
      success: false,
      message: "Resource could not be found.",
    };
  }

  const { error: deleteError } =
    await supabase
      .from("resources")
      .delete()
      .eq("id", resourceId);

  if (deleteError) {
    return {
      success: false,
      message: deleteError.message,
    };
  }

  if (resource.storage_path) {
    await supabase.storage
      .from("resources")
      .remove([
        resource.storage_path,
      ]);
  }

  revalidatePath("/resources");

  return {
    success: true,
    message: "Resource deleted successfully.",
  };
}