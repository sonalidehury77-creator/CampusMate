"use client";

import { useState } from "react";

import { createClient } from "@/lib/supabase/client";


type SubmissionFileUploadProps = {
  assignmentId: string;

  onUploaded: (
    path: string,
  ) => void;
};


const MAX_FILE_SIZE =
  25 * 1024 * 1024;


const ALLOWED_TYPES = [
  "application/pdf",

  "image/jpeg",
  "image/png",
  "image/webp",

  "text/plain",

  "application/msword",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.ms-powerpoint",

  "application/vnd.openxmlformats-officedocument.presentationml.presentation",

  "application/vnd.ms-excel",

  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  "application/zip",
];


export function SubmissionFileUpload({
  assignmentId,
  onUploaded,
}: SubmissionFileUploadProps) {
  const [
    uploading,
    setUploading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  const [
    fileName,
    setFileName,
  ] =
    useState<string | null>(
      null,
    );


  async function handleUpload(
    file: File,
  ) {
    setError(null);

    if (
      file.size >
      MAX_FILE_SIZE
    ) {
      setError(
        "File size must be 25 MB or smaller.",
      );

      return;
    }

    if (
      !ALLOWED_TYPES.includes(
        file.type,
      )
    ) {
      setError(
        "This file type is not supported.",
      );

      return;
    }


    setUploading(true);


    try {
      const supabase =
        createClient();


      /* ------------------------------------------------------
         GET AUTHENTICATED USER
      ------------------------------------------------------ */

      const {
        data: {
          user,
        },
      } =
        await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "Please sign in again.",
        );
      }


      /* ------------------------------------------------------
         CREATE SAFE FILE NAME
      ------------------------------------------------------ */

      const safeName =
        file.name.replace(
          /[^a-zA-Z0-9._-]/g,
          "_",
        );


      /* ------------------------------------------------------
         STORAGE PATH
      ------------------------------------------------------ */

      const path =
        `submissions/${user.id}/${assignmentId}/${crypto.randomUUID()}-${safeName}`;


      /* ------------------------------------------------------
         UPLOAD
      ------------------------------------------------------ */

      const {
        error:
          uploadError,
      } =
        await supabase.storage
          .from(
            "assignment-files",
          )
          .upload(
            path,
            file,
            {
              cacheControl:
                "3600",

              upsert:
                false,

              contentType:
                file.type,
            },
          );


      if (uploadError) {
        throw new Error(
          `File upload failed: ${uploadError.message}`,
        );
      }


      setFileName(
        file.name,
      );

      onUploaded(
        path,
      );
    } catch (
      uploadError
    ) {
      setError(
        uploadError instanceof
          Error
          ? uploadError.message
          : "Upload failed.",
      );
    } finally {
      setUploading(
        false,
      );
    }
  }


  return (
    <div className="space-y-3">

      <label
        htmlFor="submission_file"
        className="block text-sm font-semibold"
      >
        Attach submission
      </label>


      <input
        id="submission_file"
        type="file"
        disabled={
          uploading
        }
        onChange={(
          event,
        ) => {
          const file =
            event.target.files?.[0];

          if (file) {
            void handleUpload(
              file,
            );
          }
        }}
        className="block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
      />


      <p className="text-xs text-muted-foreground">
        Maximum file size: 25 MB.
      </p>


      {uploading && (
        <p className="text-sm text-slate-500">
          Uploading file...
        </p>
      )}


      {fileName && (
        <p className="text-sm font-medium text-emerald-600">
          Uploaded:{" "}
          {fileName}
        </p>
      )}


      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}

    </div>
  );
}