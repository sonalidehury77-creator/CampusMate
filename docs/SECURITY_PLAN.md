# CampusMate — Security Plan

# 1. Purpose

Security is a core part of CampusMate.

CampusMate will store information relating to:

* Student profiles
* Academic information
* Attendance
* Assignments
* Study progress
* Uploaded resources
* Faculty information
* Administrative information
* AI conversations

Therefore, security must be designed into the application from the beginning.

---

# 2. Security Principles

CampusMate will follow:

* Least privilege
* Defense in depth
* Secure authentication
* Role-based authorization
* Database-level access control
* Input validation
* Secure file handling
* Secure secrets management
* Safe error handling
* Auditability
* Data minimization

---

# 3. Authentication

Supabase Auth will manage authentication.

Supported functionality:

* Registration
* Login
* Logout
* Password recovery
* Session management

The application must not implement its own password storage system.

Passwords should never be stored in CampusMate application tables.

---

# 4. Authorization

Authentication answers:

> Who are you?

Authorization answers:

> What are you allowed to do?

CampusMate must implement both.

Roles:

```text
student
faculty
admin
```

---

# 5. Role-Based Access

## Student

Can access:

* Own profile
* Own academic information
* Authorized subjects
* Own notes
* Own study plans
* Own attendance information
* Relevant assignments
* Relevant notices
* Authorized resources
* AI features

## Faculty

Can access:

* Own profile
* Assigned subjects
* Authorized students
* Attendance for assigned classes
* Assignments they manage
* Resources they manage
* Authorized announcements

## Admin

Can access authorized administrative functionality.

---

# 6. Never Trust the Frontend

Hiding a button is not security.

For example:

```text
if admin:
    show Admin button
```

does not protect the admin functionality.

A malicious user could attempt to call backend endpoints directly.

Therefore, authorization must also be enforced on the server and database.

---

# 7. Row Level Security

Supabase Row Level Security will be used for appropriate tables.

Examples:

A student should be able to read their own private notes.

A student should not be able to read another student's private notes.

A faculty member should not automatically access every student's private data.

An admin should have only the permissions necessary for administrative operations.

---

# 8. Database Security

Database policies should verify:

* Authenticated user
* User identity
* User role
* Ownership
* Relevant academic relationship

Example conceptual rule:

```text
Student can read:
their own student record
```

rather than:

```text
Any logged-in user can read all student records
```

---

# 9. Server-Side Secrets

Secrets must never be placed in:

* GitHub
* public source code
* client-side JavaScript
* screenshots
* documentation
* public repositories

Examples of secrets:

* OpenAI API key
* Supabase server-side secret keys
* Other private API credentials

Environment variables will be used.

---

# 10. Environment Variables

Development secrets will be stored in:

```text
.env.local
```

The file must be included in `.gitignore`.

A safe template may eventually be created:

```text
.env.example
```

The example file must contain variable names only, not real secrets.

---

# 11. Git Security

Before pushing to GitHub, check that private files are excluded.

Examples:

```text
.env
.env.local
.env.*.local
```

The exact `.gitignore` will be generated and reviewed during project setup.

---

# 12. Input Validation

All user-controlled input should be validated.

Examples:

* Name
* Email
* Phone
* Assignment title
* Notice title
* Notes
* Search queries
* File metadata

Validation should happen at appropriate boundaries.

Frontend validation improves user experience.

Server-side validation is required for security.

---

# 13. SQL Injection

The application should not construct SQL using raw user strings.

Use safe database access methods and parameterized queries through the selected backend tools.

Never concatenate arbitrary user input into SQL statements.

---

# 14. XSS Protection

User-generated text should not be rendered as executable HTML without sanitization.

Potential sources:

* Notes
* Community posts
* Marketplace listings
* Comments
* Notice content

Any rich-text functionality will require careful sanitization.

---

# 15. File Upload Security

CampusMate will allow uploads such as:

* PDFs
* Images
* Documents

Uploads must be checked for:

* Authentication
* Authorization
* File size
* File type
* File extension
* Storage path
* Processing permissions

Do not trust the filename supplied by the user.

---

# 16. Storage Security

Supabase Storage buckets should use appropriate access policies.

Private student files should not be publicly accessible.

Where required, secure access mechanisms should be used.

---

# 17. AI Security

The AI system must:

* Never receive passwords
* Never receive API secrets
* Receive only required context
* Respect authorization
* Avoid unrestricted database access
* Avoid arbitrary SQL execution
* Handle uploaded files safely
* Have usage limits

---

# 18. AI Prompt Injection

Uploaded documents and user content may contain malicious instructions intended to manipulate AI behavior.

Therefore, AI processing should treat document contents as data rather than trusted instructions.

The system should maintain a clear separation between:

```text
System instructions
Application instructions
User request
Untrusted document content
```

---

# 19. Authorization Before AI Context

Before information is sent to AI:

```text
User
 ↓
Authenticated?
 ↓
Authorized?
 ↓
Retrieve allowed data
 ↓
AI context
```

Never:

```text
User
 ↓
Give AI whole database
```

---

# 20. Session Security

The application should use secure authentication/session handling provided by the selected authentication platform.

Logout should invalidate the appropriate client session.

Protected routes should verify authentication.

---

# 21. Protected Routes

Pages such as:

```text
/dashboard
/academics
/attendance
/assignments
/profile
/admin
/faculty
```

should not expose private information to unauthenticated users.

---

# 22. Admin Protection

Administrative functionality requires additional authorization.

Changing a URL from:

```text
/dashboard
```

to:

```text
/admin
```

must not grant access.

The server/database must reject unauthorized requests.

---

# 23. Faculty Protection

Faculty permissions should be limited to assigned academic areas.

For example:

Faculty A should not automatically be able to modify attendance for Faculty B's subject.

---

# 24. Student Data Privacy

Private student data should not be exposed unnecessarily.

Examples:

* Personal notes
* Private study plans
* Private AI conversations
* Personal profile information

The application should follow data minimization.

---

# 25. Error Handling

Errors should be useful to developers but safe for users.

Do not expose:

* Database credentials
* SQL statements containing sensitive information
* Internal stack traces
* API keys
* Server configuration

Example user-facing error:

> Something went wrong. Please try again.

Detailed diagnostic information should remain in appropriate development/server logs.

---

# 26. Rate Limiting

Rate limiting should eventually be applied to sensitive or expensive operations.

Examples:

* Login attempts
* AI requests
* File uploads
* Notice processing
* Search
* Public forms

Exact limits will be configured during implementation.

---

# 27. AI Cost Abuse

AI endpoints should not be freely callable without limits.

Potential controls:

* Authentication
* Per-user limits
* Request limits
* Usage tracking
* Maximum file size
* Maximum context size

---

# 28. Audit Logs

Important administrative actions should be recorded.

Examples:

```text
notice_created
notice_updated
student_updated
faculty_updated
resource_deleted
```

Audit logs should be protected from ordinary users.

---

# 29. Data Deletion

The application should eventually provide appropriate mechanisms for users or administrators to delete data according to the application's data policies.

Deletion rules must respect relationships and institutional requirements.

---

# 30. Backups

The production database should use appropriate backup capabilities provided by the database platform.

Important production data should not rely solely on a developer's local computer.

---

# 31. Dependency Security

Dependencies should be kept reasonably current.

Before major updates:

1. Check compatibility.
2. Update carefully.
3. Run the application.
4. Test important features.
5. Commit changes only after verification.

Do not blindly update every package.

---

# 32. Security Testing

We will test:

### Authentication

* Wrong password
* Logged-out access
* Session expiration

### Authorization

* Student accessing admin
* Student accessing another student's private data
* Faculty accessing unauthorized subject

### Input

* Empty values
* Very long values
* Invalid values
* Malicious strings

### Files

* Unsupported type
* Oversized file
* Unauthorized file access

### AI

* Unauthorized context
* Prompt injection
* Excessive requests

---

# 33. Production Security Checklist

Before production:

* Authentication works
* Authorization works
* RLS policies tested
* Secrets protected
* `.env.local` not committed
* File permissions checked
* Error messages reviewed
* AI endpoints protected
* Rate limits considered
* Admin routes protected
* Faculty permissions tested
* Student permissions tested
* Database policies reviewed

---

# 34. Security Development Philosophy

Security will not be a final feature.

Every new feature must answer:

```text
Who can access it?
Who can create data?
Who can modify it?
Who can delete it?
Who can view it?
What happens if an unauthorized user tries?
```

This question should be answered before marking a feature complete.

---

# 35. Security Goal

CampusMate should provide a secure foundation that can support future institutional use.

The goal is not to claim that the application is automatically secure simply because Supabase is being used.

Security depends on:

* Correct authentication
* Correct authorization
* Correct database policies
* Secure application code
* Safe file handling
* Proper secret management
* Testing
* Ongoing maintenance
