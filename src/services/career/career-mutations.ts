
"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";


/* -------------------------------------------------------------------------- */
/* CURRENT STUDENT                                                            */
/* -------------------------------------------------------------------------- */

async function getCurrentStudentId() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("You must be signed in.");
  }

  /*
   * IMPORTANT:
   * Career tables use students.id as student_id.
   * They do NOT use profiles.id.
   */
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("id, profile_id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (studentError) {
    throw new Error(studentError.message);
  }

  if (!student) {
    throw new Error(
      "Student profile was not found. Please complete student onboarding first.",
    );
  }

  return {
    supabase,
    studentId: student.id,
    profileId: student.profile_id,
  };
}

/* -------------------------------------------------------------------------- */
/* CAREER PROFILE                                                             */
/* -------------------------------------------------------------------------- */

export async function saveCareerProfile(
  formData: FormData,
): Promise<void> {
  const { supabase, studentId } = await getCurrentStudentId();

  const payload = {
    student_id: studentId,

    target_role:
      String(formData.get("target_role") ?? "").trim() || null,

    target_industry:
      String(formData.get("target_industry") ?? "").trim() || null,

    target_company_type:
      String(formData.get("target_company_type") ?? "").trim() || null,

    career_summary:
      String(formData.get("career_summary") ?? "").trim() || null,

    github_url:
      String(formData.get("github_url") ?? "").trim() || null,

    linkedin_url:
      String(formData.get("linkedin_url") ?? "").trim() || null,

    portfolio_url:
      String(formData.get("portfolio_url") ?? "").trim() || null,

    resume_url:
      String(formData.get("resume_url") ?? "").trim() || null,

    availability_status:
      String(
        formData.get("availability_status") ??
          "open_to_opportunities",
      ),
  };

  const { error } = await supabase
    .from("career_profiles")
    .upsert(payload, {
      onConflict: "student_id",
    });

  if (error) {
    throw new Error(
      `Unable to save career profile: ${error.message}`,
    );
  }

  revalidatePath("/career");
  revalidatePath("/career/profile");
}

/* -------------------------------------------------------------------------- */
/* STUDENT SKILLS                                                             */
/* -------------------------------------------------------------------------- */

export async function saveStudentSkill(
  formData: FormData,
): Promise<void> {
  const { supabase, studentId } = await getCurrentStudentId();

  const skillId = String(
    formData.get("skill_id") ?? "",
  ).trim();

  if (!skillId) {
    throw new Error("Please select a skill.");
  }

  const proficiencyLevel = Number(
    formData.get("proficiency_level") ?? 1,
  );

  if (
    !Number.isInteger(proficiencyLevel) ||
    proficiencyLevel < 1 ||
    proficiencyLevel > 5
  ) {
    throw new Error(
      "Proficiency level must be between 1 and 5.",
    );
  }

  const yearsExperienceRaw = String(
    formData.get("years_experience") ?? "",
  ).trim();

  const yearsExperience =
    yearsExperienceRaw === ""
      ? null
      : Number(yearsExperienceRaw);

  if (
    yearsExperience !== null &&
    (!Number.isFinite(yearsExperience) ||
      yearsExperience < 0)
  ) {
    throw new Error(
      "Years of experience must be a valid positive number.",
    );
  }

  const evidence =
    String(formData.get("evidence") ?? "").trim() || null;

  const { error } = await supabase
    .from("student_career_skills")
    .upsert(
      {
        student_id: studentId,
        skill_id: skillId,
        proficiency_level: proficiencyLevel,
        years_experience: yearsExperience,
        evidence,
      },
      {
        onConflict: "student_id,skill_id",
      },
    );

  if (error) {
    throw new Error(
      `Unable to save skill: ${error.message}`,
    );
  }

  revalidatePath("/career");
  revalidatePath("/career/skills");
}

/* -------------------------------------------------------------------------- */
/* DELETE STUDENT SKILL                                                       */
/* -------------------------------------------------------------------------- */

export async function deleteStudentSkill(
  formData: FormData,
): Promise<void> {
  const { supabase, studentId } = await getCurrentStudentId();

  const id = String(
    formData.get("id") ?? "",
  ).trim();

  if (!id) {
    throw new Error("Skill record ID is missing.");
  }

  const { error } = await supabase
    .from("student_career_skills")
    .delete()
    .eq("id", id)
    .eq("student_id", studentId);

  if (error) {
    throw new Error(
      `Unable to delete skill: ${error.message}`,
    );
  }

  revalidatePath("/career");
  revalidatePath("/career/skills");
}

/* -------------------------------------------------------------------------- */
/* PROJECTS                                                                   */
/* -------------------------------------------------------------------------- */

export async function saveCareerProject(
  formData: FormData,
): Promise<void> {
  const { supabase, studentId } =
    await getCurrentStudentId();

  const id = String(
    formData.get("id") ?? "",
  ).trim();

  const title = String(
    formData.get("title") ?? "",
  ).trim();

  if (!title) {
    throw new Error("Project title is required.");
  }

  const payload = {
    student_id: studentId,

    title,

    description:
      String(formData.get("description") ?? "").trim() ||
      null,

    project_type:
      String(formData.get("project_type") ?? "").trim() ||
      null,

    status:
      String(formData.get("status") ?? "idea"),

    github_url:
      String(formData.get("github_url") ?? "").trim() ||
      null,

    live_url:
      String(formData.get("live_url") ?? "").trim() ||
      null,

    started_at:
      String(formData.get("started_at") ?? "").trim() ||
      null,

    completed_at:
      String(formData.get("completed_at") ?? "").trim() ||
      null,

    featured:
      formData.get("featured") !== null,
  };

  let projectId = id;

  /* ------------------------------ UPDATE ------------------------------ */

  if (id) {
    const { data: updatedProject, error } = await supabase
      .from("career_projects")
      .update(payload)
      .eq("id", id)
      .eq("student_id", studentId)
      .select("id")
      .single();

    if (error) {
      throw new Error(
        `Unable to update project: ${error.message}`,
      );
    }

    projectId = updatedProject.id;

    /*
     * Remove old project-skill relationships before
     * inserting the newly selected skills.
     */
    const { error: deleteSkillsError } = await supabase
      .from("career_project_skills")
      .delete()
      .eq("project_id", projectId);

    if (deleteSkillsError) {
      throw new Error(
        `Unable to update project skills: ${deleteSkillsError.message}`,
      );
    }
  }

  /* ------------------------------ INSERT ------------------------------- */

  else {
    const { data: newProject, error } = await supabase
      .from("career_projects")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      throw new Error(
        `Unable to save project: ${error.message}`,
      );
    }

    projectId = newProject.id;
  }

  /* --------------------------- PROJECT SKILLS -------------------------- */

  const selectedSkillIds = formData
    .getAll("skills")
    .map((value) => String(value).trim())
    .filter(Boolean);

  if (selectedSkillIds.length > 0) {
    const projectSkillRows = selectedSkillIds.map(
      (skillId) => ({
        project_id: projectId,
        skill_id: skillId,
      }),
    );

    const { error: projectSkillsError } =
      await supabase
        .from("career_project_skills")
        .insert(projectSkillRows);

    if (projectSkillsError) {
      throw new Error(
        `Unable to save project skills: ${projectSkillsError.message}`,
      );
    }
  }

  revalidatePath("/career");
  revalidatePath("/career/projects");
}

/* -------------------------------------------------------------------------- */
/* DELETE PROJECT                                                             */
/* -------------------------------------------------------------------------- */

export async function deleteCareerProject(
  formData: FormData,
): Promise<void> {
  const { supabase, studentId } =
    await getCurrentStudentId();

  const id = String(
    formData.get("id") ?? "",
  ).trim();

  if (!id) {
    throw new Error("Project ID is missing.");
  }

  const { error } = await supabase
    .from("career_projects")
    .delete()
    .eq("id", id)
    .eq("student_id", studentId);

  if (error) {
    throw new Error(
      `Unable to delete project: ${error.message}`,
    );
  }

  revalidatePath("/career");
  revalidatePath("/career/projects");
}

/* -------------------------------------------------------------------------- */
/* CERTIFICATIONS                                                             */
/* -------------------------------------------------------------------------- */

export async function saveCareerCertification(
  formData: FormData,
): Promise<void> {
  const { supabase, studentId } =
    await getCurrentStudentId();

  const id = String(
    formData.get("id") ?? "",
  ).trim();

  const name = String(
    formData.get("name") ?? "",
  ).trim();

  if (!name) {
    throw new Error(
      "Certification name is required.",
    );
  }

  const payload = {
    student_id: studentId,

    name,

    issuing_organization:
      String(
        formData.get("issuing_organization") ?? "",
      ).trim() || null,

    credential_id:
      String(
        formData.get("credential_id") ?? "",
      ).trim() || null,

    credential_url:
      String(
        formData.get("credential_url") ?? "",
      ).trim() || null,

    issue_date:
      String(
        formData.get("issue_date") ?? "",
      ).trim() || null,

    expiry_date:
      String(
        formData.get("expiry_date") ?? "",
      ).trim() || null,

    does_not_expire:
      formData.get("does_not_expire") !== null,
  };

  /* ------------------------------ UPDATE ------------------------------ */

  if (id) {
    const { error } = await supabase
      .from("career_certifications")
      .update(payload)
      .eq("id", id)
      .eq("student_id", studentId);

    if (error) {
      throw new Error(
        `Unable to update certification: ${error.message}`,
      );
    }
  }

  /* ------------------------------ INSERT ------------------------------- */

  else {
    const { error } = await supabase
      .from("career_certifications")
      .insert(payload);

    if (error) {
      throw new Error(
        `Unable to save certification: ${error.message}`,
      );
    }
  }

  revalidatePath("/career");
  revalidatePath("/career/certifications");
}

/* -------------------------------------------------------------------------- */
/* DELETE CERTIFICATION                                                       */
/* -------------------------------------------------------------------------- */

export async function deleteCareerCertification(
  formData: FormData,
): Promise<void> {
  const { supabase, studentId } =
    await getCurrentStudentId();

  const id = String(
    formData.get("id") ?? "",
  ).trim();

  if (!id) {
    throw new Error(
      "Certification ID is missing.",
    );
  }

  const { error } = await supabase
    .from("career_certifications")
    .delete()
    .eq("id", id)
    .eq("student_id", studentId);

  if (error) {
    throw new Error(
      `Unable to delete certification: ${error.message}`,
    );
  }

  revalidatePath("/career");
  revalidatePath("/career/certifications");
}

/* -------------------------------------------------------------------------- */
/* CAREER GOALS                                                               */
/* -------------------------------------------------------------------------- */

export async function saveCareerGoal(
  formData: FormData,
): Promise<void> {
  const { supabase, studentId } =
    await getCurrentStudentId();

  const id = String(
    formData.get("id") ?? "",
  ).trim();

  const progress = Number(
    formData.get("progress") ?? 0,
  );

  if (
    !Number.isInteger(progress) ||
    progress < 0 ||
    progress > 100
  ) {
    throw new Error(
      "Progress must be between 0 and 100.",
    );
  }

  const title = String(
    formData.get("title") ?? "",
  ).trim();

  if (!title) {
    throw new Error(
      "Goal title is required.",
    );
  }

  const payload = {
    student_id: studentId,

    title,

    description:
      String(
        formData.get("description") ?? "",
      ).trim() || null,

    goal_type:
      String(
        formData.get("goal_type") ?? "job",
      ),

    target_date:
      String(
        formData.get("target_date") ?? "",
      ).trim() || null,

    status:
      String(
        formData.get("status") ?? "active",
      ),

    progress,
  };

  /* ------------------------------ UPDATE ------------------------------ */

  if (id) {
    const { error } = await supabase
      .from("career_goals")
      .update(payload)
      .eq("id", id)
      .eq("student_id", studentId);

    if (error) {
      throw new Error(
        `Unable to update career goal: ${error.message}`,
      );
    }
  }

  /* ------------------------------ INSERT ------------------------------- */

  else {
    const { error } = await supabase
      .from("career_goals")
      .insert(payload);

    if (error) {
      throw new Error(
        `Unable to save career goal: ${error.message}`,
      );
    }
  }

  revalidatePath("/career");
  revalidatePath("/career/goals");
}

/* -------------------------------------------------------------------------- */
/* DELETE CAREER GOAL                                                         */
/* -------------------------------------------------------------------------- */

export async function deleteCareerGoal(
  formData: FormData,
): Promise<void> {
  const { supabase, studentId } =
    await getCurrentStudentId();

  const id = String(
    formData.get("id") ?? "",
  ).trim();

  if (!id) {
    throw new Error(
      "Goal ID is missing.",
    );
  }

  const { error } = await supabase
    .from("career_goals")
    .delete()
    .eq("id", id)
    .eq("student_id", studentId);

  if (error) {
    throw new Error(
      `Unable to delete career goal: ${error.message}`,
    );
  }

  revalidatePath("/career");
  revalidatePath("/career/goals");
}

