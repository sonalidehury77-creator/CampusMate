# CampusMate — Student Profile & Onboarding

## Purpose

The Student Profile & Onboarding system connects an authenticated CampusMate account with the student's academic identity.

It is responsible for collecting the information required to create a complete student profile and associate the user with the correct academic structure.

The onboarding flow is completed after successful authentication and before the student can access the main CampusMate dashboard.

---

# 1. Authentication Flow

CampusMate uses the following relationship:

```text
auth.users
    ↓
profiles
    ↓
students
```

### `auth.users`

Supabase Authentication manages the user's authentication account.

It provides:

* User ID
* Email
* Authentication status
* Authentication credentials

The authenticated user's ID is used as the identity throughout CampusMate.

---

### `profiles`

The `profiles` table stores application-level information associated with the authenticated user.

Important fields include:

* `id`
* `full_name`
* `email`
* `avatar_url`
* `role`
* `phone`

The `profiles.id` is linked to the authenticated Supabase user ID.

```text
auth.users.id
      ↓
profiles.id
```

---

### `students`

The `students` table stores the academic identity of the user.

Important fields include:

* `id`
* `profile_id`
* `student_number`
* `program_id`
* `semester_id`
* `enrollment_year`
* `current_semester`

Relationship:

```text
profiles.id
      ↓
students.profile_id
```

A student is considered onboarded when the authenticated user's profile has a corresponding record in `public.students`.

---

# 2. Onboarding Flow

CampusMate uses a **two-step onboarding form**.

```text
Step 1
Personal Information
        ↓
Step 2
Academic Information
        ↓
Validation
        ↓
Save Profile
        ↓
Create Student Record
        ↓
Dashboard
```

---

# 3. Step 1 — Personal Information

The first onboarding step collects the student's basic personal information.

### Fields

#### Full Name

Required field.

The student enters their full name.

Validation:

* Must not be empty
* Must contain at least 2 characters

The value is saved to:

```text
profiles.full_name
```

---

### Email

The student's email address is taken from the authenticated account.

The email is:

* Displayed during onboarding
* Not editable through onboarding
* Not submitted as editable profile data

The email originates from the authenticated CampusMate account.

```text
auth.users.email
        ↓
profiles.email
```

---

### Phone Number

Optional field.

The student may provide a phone number.

It is saved to:

```text
profiles.phone
```

If the field is empty, the application stores it as `NULL`.

---

### Student Number

Required field.

The student enters their university/student identification number.

The value is stored in:

```text
students.student_number
```

CampusMate checks whether the student number has already been registered before creating the student record.

---

# 4. Step 2 — Academic Information

After completing the personal information, the student continues to the academic information step.

The academic information follows the hierarchy:

```text
Department
    ↓
Program
    ↓
Semester
```

---

# 5. Department Selection

The student selects their department from the available academic departments.

Example:

```text
Computer Science
```

The selected department is represented by:

```text
departments.id
```

The department itself is not stored directly inside the `students` table.

Instead, the department determines which programs are available.

---

# 6. Program Selection

After selecting a department, CampusMate displays programs belonging to that department.

For example:

```text
Department
Computer Science

        ↓

Program
B.Sc. Computer Science
```

The program is identified using:

```text
programs.id
```

CampusMate validates that the selected program actually belongs to the selected department.

This prevents invalid combinations such as:

```text
Department A
    ↓
Program belonging to Department B
```

---

# 7. Semester Selection

After selecting the program, CampusMate displays the semesters belonging to that program.

Example:

```text
B.Sc. Computer Science
        ↓
Semester 1
Semester 2
Semester 3
Semester 4
Semester 5
Semester 6
```

The selected semester is identified using:

```text
semesters.id
```

CampusMate validates that the selected semester belongs to the selected program.

---

# 8. Enrollment Year

The student provides their enrollment year.

Example:

```text
2024
```

This value is stored in:

```text
students.enrollment_year
```

The onboarding validation accepts enrollment years from 2000 to 2100.

---

# 9. Current Semester

The current semester is derived from the selected semester.

For example:

```text
Selected Semester:
Semester 5

        ↓

students.current_semester
        =
5
```

The student does not need to enter the numeric current semester separately.

CampusMate obtains the value from the selected semester record.

---

# 10. Academic Data Relationship

The academic structure used during onboarding is:

```text
Department
    │
    └── Program
            │
            └── Semester
                    │
                    └── Subjects
```

Database relationships:

```text
departments.id
      ↓
programs.department_id

programs.id
      ↓
semesters.program_id

programs.id
      ↓
students.program_id

semesters.id
      ↓
students.semester_id
```

This structure allows CampusMate to determine the student's complete academic context.

---

# 11. Onboarding Validation

CampusMate performs server-side validation before saving onboarding information.

The validation is performed using the onboarding server action.

The following information is validated:

### Personal Information

* Full name
* Phone number
* Student number

### Academic Information

* Department
* Program
* Semester
* Enrollment year

---

## Department Validation

CampusMate verifies that the selected department exists.

```text
department_id
      ↓
departments
```

If the department does not exist, onboarding is rejected.

---

## Program Validation

CampusMate verifies:

1. The program exists.
2. The program belongs to the selected department.

```text
Selected Department
        ↓
Selected Program
```

An invalid department/program combination is rejected.

---

## Semester Validation

CampusMate verifies:

1. The semester exists.
2. The semester belongs to the selected program.

```text
Selected Program
        ↓
Selected Semester
```

An invalid program/semester combination is rejected.

---

## Student Number Validation

Before creating a student record, CampusMate checks whether the student number is already registered.

If another account already uses the student number, onboarding is rejected.

Example:

```text
Student Number
       ↓
Already registered?
   ↙          ↘
 YES           NO
  ↓             ↓
Reject       Continue
```

---

# 12. Authenticated User Verification

Onboarding can only be completed by an authenticated CampusMate user.

CampusMate obtains the authenticated user's ID from Supabase Authentication.

```text
Authenticated User
        ↓
auth.uid()
        ↓
Current Profile
        ↓
Student Record
```

If the user is not authenticated, onboarding is rejected and the user must sign in.

---

# 13. Profile Update

After all validation succeeds, CampusMate updates the authenticated user's profile.

The following fields can be updated during onboarding:

```text
profiles.full_name
profiles.phone
```

The authenticated email and application role are not changed by onboarding.

---

# 14. Student Record Creation

After the profile is successfully updated, CampusMate creates the student's academic record.

The record contains:

```text
profile_id
student_number
program_id
semester_id
enrollment_year
current_semester
```

Example:

```text
profile_id       → authenticated user's profile
student_number   → university student number
program_id       → selected program
semester_id      → selected semester
enrollment_year  → student's enrollment year
current_semester → selected semester number
```

---

# 15. Application Role Security

Students cannot choose their own application role during onboarding.

CampusMate application roles are:

```text
student
faculty
admin
```

The onboarding form does not contain a role-selection field.

A newly registered user receives the appropriate application role through the application's controlled authentication/profile process.

Students cannot promote themselves to:

```text
faculty
```

or:

```text
admin
```

This prevents privilege escalation through the onboarding form.

---

# 16. Row Level Security

CampusMate uses Supabase Row Level Security (RLS) to protect user data.

For student creation, the authenticated user can create their own student record only when:

```text
profile_id = auth.uid()
```

Conceptually:

```text
Authenticated User
        │
        ├── Can create own student record
        │
        └── Cannot create another user's student record
```

Student profile access is similarly restricted so that users cannot freely access or modify another student's personal information.

Administrative operations are handled separately through controlled admin permissions.

---

# 17. Existing Student Detection

CampusMate checks whether the authenticated user already has a student record.

```text
Authenticated User
        ↓
Search students.profile_id
        ↓
      Exists?
      ↙    ↘
    YES     NO
     ↓       ↓
Dashboard  Onboarding
```

If a student record already exists, the user does not need to complete onboarding again.

CampusMate redirects the user to:

```text
/dashboard
```

---

# 18. Successful Onboarding

When all information is valid:

```text
Personal Information
        ↓
Academic Information
        ↓
Server Validation
        ↓
Profile Updated
        ↓
Student Record Created
        ↓
Onboarding Complete
        ↓
/dashboard
```

The student can then access the main CampusMate application.

---

# 19. Onboarding Completion Detection

CampusMate determines onboarding completion by checking whether the authenticated user's profile has a corresponding record in:

```text
public.students
```

Conceptually:

```text
auth.uid()
   ↓
profiles.id
   ↓
students.profile_id
```

If a matching student record exists:

```text
Onboarding = Complete
```

If no matching student record exists:

```text
Onboarding = Incomplete
```

---

# 20. Profile Editing After Onboarding

After onboarding, students can edit selected profile information.

Currently editable:

* Full name
* Phone number

The following are not editable from the normal student profile:

* Authentication email
* Application role
* Student number
* Program
* Semester
* Enrollment identity

Academic identity changes should be handled through controlled academic/admin workflows rather than unrestricted student editing.

---

# 21. Data Ownership

CampusMate separates authentication identity, personal profile information and academic identity.

```text
Authentication
     │
     │
     ▼
auth.users
     │
     ▼
profiles
     │
     ▼
students
     │
     ├── program
     │      ↓
     │   department
     │
     └── semester
            ↓
         subjects
```

This separation makes the system easier to secure, maintain and extend.

---

# 22. Current Onboarding Fields

| Step     | Field            |         Required | Database                    |
| -------- | ---------------- | ---------------: | --------------------------- |
| Personal | Full Name        |              Yes | `profiles.full_name`        |
| Personal | Email            | Account-provided | `profiles.email`            |
| Personal | Phone            |               No | `profiles.phone`            |
| Personal | Student Number   |              Yes | `students.student_number`   |
| Academic | Department       |              Yes | Used to validate program    |
| Academic | Program          |              Yes | `students.program_id`       |
| Academic | Semester         |              Yes | `students.semester_id`      |
| Academic | Enrollment Year  |              Yes | `students.enrollment_year`  |
| Academic | Current Semester |          Derived | `students.current_semester` |

---

# 23. Current Onboarding Architecture

The current implementation consists of:

```text
src/app/onboarding/
│
├── page.tsx
├── onboarding-form.tsx
└── actions.ts
```

### `page.tsx`

Responsible for:

* Checking authentication
* Loading the authenticated user's profile
* Checking whether onboarding is already complete
* Loading departments
* Loading programs
* Loading semesters
* Passing the required data to the onboarding form

---

### `onboarding-form.tsx`

Responsible for the client-side onboarding interface.

It provides:

* Two-step onboarding
* Personal information form
* Academic information form
* Department selection
* Program filtering
* Semester filtering
* Form state
* Loading state
* Validation error display
* Back/Continue navigation
* Complete Setup action

The academic dropdowns are dependent:

```text
Department
    ↓
Available Programs
    ↓
Available Semesters
```

---

### `actions.ts`

Responsible for secure server-side onboarding processing.

It performs:

* Authentication verification
* Input validation
* Existing student detection
* Student number duplication check
* Department validation
* Program validation
* Department/program relationship validation
* Semester validation
* Program/semester relationship validation
* Profile update
* Student record creation
* Redirect to dashboard

---

# 24. Error Handling

CampusMate does not assume that database operations always succeed.

Errors are handled for:

* Authentication
* Profile loading
* Student lookup
* Department loading
* Program loading
* Semester loading
* Profile update
* Student creation

Validation errors are returned to the onboarding form and displayed to the student.

Examples:

```text
Full name must be at least 2 characters.
```

```text
Student number is required.
```

```text
Please select a valid department.
```

```text
Please select a valid program for this department.
```

```text
Please select a valid semester for this program.
```

```text
This student number is already registered.
```

---

# 25. Future Improvements

The onboarding system is designed so additional student information can be introduced without changing the basic authentication architecture.

Planned improvements include:

### Profile

* Profile avatar upload
* Supabase Storage integration
* Profile image management

### Academic

* Student subject selection
* Academic preferences
* Academic performance information
* Current academic session
* Class/section information

### Notifications

* Notification preferences
* Email notification preferences
* Push notification preferences
* Academic reminder preferences

### Personalization

* Career preferences
* Learning preferences
* Study preferences
* AI personalization profile

### AI

CampusMate can eventually use the student's academic profile to personalize AI features.

For example:

```text
Student Profile
      ↓
Program
      ↓
Semester
      ↓
Subjects
      ↓
Academic Progress
      ↓
AI Personalization
```

This can allow the CampusMate AI assistant to provide more relevant:

* Study plans
* Subject explanations
* Revision schedules
* Assignment assistance
* Exam preparation
* Academic recommendations
* Career guidance

---

# 26. Final Architecture

The complete student identity architecture is:

```text
                    Supabase Auth
                         │
                         ▼
                    auth.users
                         │
                         │ user ID
                         ▼
                     profiles
                         │
                         │ profile_id
                         ▼
                     students
                    /    |     \
                   /     |      \
                  ▼      ▼       ▼
             Program  Semester  Student Number
                │        │
                ▼        ▼
           Department  Subjects
```

The onboarding system connects these entities safely and establishes the authenticated user's identity as a CampusMate student.

Once the student record is successfully created, onboarding is considered complete and the student is redirected to the CampusMate dashboard.
