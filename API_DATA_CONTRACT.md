# IEFA Portal — Backend API Data Contract
## Learning Zone & Resources Modules

**Base URL:** `https://iefa-project-api.onrender.com/api/v1`  
**Auth:** Bearer token via `Authorization: Bearer <accessToken>` header  
**Pagination meta** (all paginated endpoints):

```json
{
  "meta": {
    "page": 1,
    "perPage": 20,
    "itemCount": 143,
    "pageCount": 8,
    "hasPreviousPage": false,
    "hasNextPage": true
  }
}
```

---

## Table of Contents

1. [Common Types](#common-types)
2. [Resources Module](#resources-module)
   - [Category Hierarchy](#resources-category-hierarchy)
   - [Entities](#resources-entities)
   - [User Endpoints](#resources-user-endpoints)
   - [Admin Endpoints](#resources-admin-endpoints)
3. [Learning Zone Module](#learning-zone-module)
   - [Entities](#learning-zone-entities)
   - [User Endpoints](#learning-zone-user-endpoints)
   - [Admin Endpoints](#learning-zone-admin-endpoints)
4. [Enum Reference](#enum-reference)
5. [Tag Convention (Resources)](#tag-convention-resources)

---

## Common Types

### PaginatedResponse\<T\>
```json
{
  "data": [],
  "meta": {
    "page": 1,
    "perPage": 20,
    "itemCount": 0,
    "pageCount": 0,
    "hasPreviousPage": false,
    "hasNextPage": false
  }
}
```

### ErrorResponse
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "field": "title", "message": "Title is required" }
  ]
}
```

---

## Resources Module

### Resources Category Hierarchy

All resources are classified under one of two **major categories**. Each major category has its own sub-category and sub-sub-category model:

```
Resources
├── General                          ← major category (tag: "major:general")
│   ├── <Dynamic sub-category>        ← ResourceCategory record (parentId: null)
│   │   └── <Dynamic sub-sub-cat>     ← ResourceCategory record (parentId: parent.id)
│   └── "Other" (custom)             ← free-text via tag: "general-sub-custom:<name>"
│
└── Regulatory                       ← major category (tag: "major:regulatory")
    ├── CBN  ─┐
    ├── SEC   │  4 fixed sub-categories  (tag: "reg-body:<id>")
    ├── NAICOM│
    └── NDIC ─┘
        └── Circulars & Directives ─┐
            Guidelines & Frameworks │
            Notices & Press Releases │  Fixed document types  (tag: "doc-type:<id>")
            Data & Statistical       │  (sub-sub-categories)
            Communiqués            ─┘
            "Other" (custom)        ─  free-text via tag: "doc-type-custom:<name>"
```

**Key rules:**
- **General** sub-categories are stored as `ResourceCategory` records in the database and are fully manageable via admin CRUD. A `ResourceCategory` can have a `parentId` to create one level of nesting.
- **Regulatory** sub-categories (regulatory bodies) and their document types are **fixed enumerations** — they are not stored as `ResourceCategory` records. They are encoded as structured tags on the resource.
- A resource belongs to exactly one major category, identified by the `major:` tag.
- `categoryId` on a resource is **only used for General** resources pointing to a dynamic `ResourceCategory`. Regulatory resources always use `null` for `categoryId` and rely entirely on tags.

---

### Fixed Reference: Regulatory Bodies

These are the 4 fixed sub-categories of the **Regulatory** major category:

```json
[
  { "id": "cbn",    "name": "CBN",    "fullName": "Central Bank of Nigeria" },
  { "id": "sec",    "name": "SEC",    "fullName": "Securities and Exchange Commission" },
  { "id": "naicom", "name": "NAICOM", "fullName": "National Insurance Commission" },
  { "id": "ndic",   "name": "NDIC",   "fullName": "Nigeria Deposit Insurance Corporation" }
]
```

Usage on a resource: tag `"reg-body:cbn"`, `"reg-body:sec"`, `"reg-body:naicom"`, `"reg-body:ndic"`.

---

### Fixed Reference: Document Types

These are the fixed sub-sub-categories under each regulatory body:

```json
[
  { "id": "circulars-directives",      "label": "Circulars & Directives" },
  { "id": "guidelines-frameworks",     "label": "Guidelines & Frameworks" },
  { "id": "notices-press-releases",    "label": "Notices & Press Releases" },
  { "id": "data-statistical-bulletins","label": "Data & Statistical Bulletins" },
  { "id": "communiques",               "label": "Communiqués" }
]
```

Usage on a resource: tag `"doc-type:circulars-directives"`, etc.  
When none of the above fits, use: `"doc-type-custom:<free-text-name>"` instead.

---

### Resources Entities

#### ResourceCategory

> ⚠️ **General only.** `ResourceCategory` records model sub-categories (and optional sub-sub-categories) for the **General** major category exclusively. Regulatory sub-categories (bodies + document types) are fixed enumerations and are **not** stored here.
```json
{
  "id": "cat-001",
  "name": "Islamic Finance Guides",
  "slug": "islamic-finance-guides",
  "parentId": null,
  "parent": null,
  "children": [
    {
      "id": "cat-002",
      "name": "Sukuk Instruments",
      "slug": "sukuk-instruments",
      "parentId": "cat-001",
      "parent": null,
      "children": []
    }
  ]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | ✅ | UUID |
| `name` | `string` | ✅ | Display name |
| `slug` | `string` | ✅ | URL-safe identifier |
| `parentId` | `string \| null` | ✅ | `null` = top-level category |
| `parent` | `ResourceCategory \| null` | — | Nested parent (read only) |
| `children` | `ResourceCategory[]` | — | Nested children (read only) |

---

#### ResourceItem (User-facing)
```json
{
  "id": "res-001",
  "title": "Introduction to Islamic Banking",
  "resourceType": "guide",
  "authorName": "IEFA Research Team",
  "authorType": "organization",
  "topic": "Islamic Banking Fundamentals",
  "briefIntro": "A comprehensive guide covering the core principles of interest-free banking under Shariah law.",
  "coverImageUrl": "https://cdn.iefa.ng/resources/covers/res-001.jpg",
  "fileUrl": "https://cdn.iefa.ng/resources/files/res-001.pdf",
  "previewUrl": "https://cdn.iefa.ng/resources/previews/res-001-preview.pdf",
  "categoryId": "cat-001",
  "category": {
    "id": "cat-001",
    "name": "Islamic Finance Guides",
    "slug": "islamic-finance-guides",
    "parentId": null
  },
  "isPremium": false,
  "isFeatured": true,
  "status": "published",
  "tags": ["major:general", "general-sub-custom:Banking"],
  "viewCount": 1240,
  "downloadCount": 382,
  "publishedAt": "2024-11-01T09:00:00.000Z",
  "createdAt": "2024-10-20T08:30:00.000Z",
  "updatedAt": "2024-11-01T09:00:00.000Z"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | ✅ | UUID |
| `title` | `string` | ✅ | Resource title |
| `resourceType` | `"guide" \| "research" \| "standard" \| "tool"` | ✅ | Maps to UI section tab |
| `authorName` | `string \| null` | — | Author or publishing organization |
| `authorType` | `"individual" \| "organization" \| null` | — | |
| `topic` | `string \| null` | — | Short subject/topic label |
| `briefIntro` | `string \| null` | — | One-paragraph description |
| `coverImageUrl` | `string \| null` | — | Thumbnail image URL |
| `fileUrl` | `string \| null` | — | Full document URL (PDF/DOCX) |
| `previewUrl` | `string \| null` | — | Preview-only document URL |
| `categoryId` | `string \| null` | — | FK to ResourceCategory |
| `category` | `ResourceCategory \| null` | — | Nested category object |
| `isPremium` | `boolean` | ✅ | If `true`, requires subscription to download |
| `isFeatured` | `boolean` | ✅ | Pinned to top in listings |
| `status` | `"draft" \| "published" \| "archived"` | ✅ | Only `published` visible to users |
| `tags` | `string[]` | ✅ | See [Tag Convention](#tag-convention-resources) |
| `viewCount` | `number` | ✅ | Incremented on open |
| `downloadCount` | `number` | ✅ | Incremented on file download |
| `publishedAt` | `string \| null` | — | ISO 8601 datetime |
| `createdAt` | `string` | ✅ | ISO 8601 datetime |
| `updatedAt` | `string` | ✅ | ISO 8601 datetime |

---

#### GlossaryTerm
```json
{
  "id": "gloss-001",
  "term": "Murabaha",
  "definition": "A cost-plus financing arrangement where the seller discloses the cost and adds an agreed-upon profit margin. Unlike interest, the markup is fixed at contract inception and does not accrue over time.",
  "letter": "M",
  "status": "published",
  "relatedTerms": ["Ijarah", "Musharakah"],
  "createdAt": "2024-09-10T12:00:00.000Z"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | ✅ | UUID |
| `term` | `string` | ✅ | The Islamic finance term/word |
| `definition` | `string` | ✅ | Full definition text |
| `letter` | `string \| null` | — | First letter (A–Z), for alphabetic indexing; derived if not supplied |
| `status` | `"draft" \| "published"` | ✅ | Only `published` visible to users |
| `relatedTerms` | `string[] \| null` | — | Related term names (not IDs) |
| `createdAt` | `string` | ✅ | ISO 8601 datetime |

---

#### UserResourceSubmission (Pending review)
```json
{
  "id": "sub-001",
  "title": "Community Guide: Takaful Models",
  "briefIntro": "A practitioner's overview of cooperative insurance structures compliant with Shariah principles.",
  "fileUrl": "https://cdn.iefa.ng/uploads/sub-001.pdf",
  "coverImageUrl": "https://cdn.iefa.ng/uploads/sub-001-cover.jpg",
  "authorName": "Ahmed Al-Rashid",
  "categoryId": "cat-003",
  "category": {
    "id": "cat-003",
    "name": "Insurance & Takaful",
    "slug": "insurance-takaful",
    "parentId": null
  },
  "subCategoryId": null,
  "subCategory": null,
  "resourceType": "guide",
  "suggestedSubCategoryName": null,
  "suggestedDocTypeName": null,
  "status": "pending",
  "submittedBy": "user-abc123",
  "createdAt": "2024-12-10T14:22:00.000Z"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | ✅ | UUID |
| `title` | `string` | ✅ | |
| `briefIntro` | `string \| null` | — | |
| `fileUrl` | `string` | ✅ | Uploaded file URL |
| `coverImageUrl` | `string \| null` | — | |
| `authorName` | `string \| null` | — | |
| `categoryId` | `string` | ✅ | Major category FK |
| `category` | `ResourceCategory \| null` | — | |
| `subCategoryId` | `string \| null` | — | Sub-category FK |
| `subCategory` | `ResourceCategory \| null` | — | |
| `resourceType` | `ResourceType \| null` | — | |
| `suggestedSubCategoryName` | `string \| null` | — | Free-text when user selects "Other" (General) |
| `suggestedDocTypeName` | `string \| null` | — | Free-text when user selects "Other" (Regulatory) |
| `status` | `"pending" \| "approved" \| "rejected"` | ✅ | |
| `submittedBy` | `string \| null` | — | User ID of submitter |
| `createdAt` | `string` | ✅ | ISO 8601 datetime |

---

#### PendingResourceSubmission (Admin view — extends UserResourceSubmission)
```json
{
  "id": "sub-001",
  "title": "Community Guide: Takaful Models",
  "briefIntro": "A practitioner's overview of cooperative insurance structures.",
  "fileUrl": "https://cdn.iefa.ng/uploads/sub-001.pdf",
  "coverImageUrl": null,
  "authorName": "Ahmed Al-Rashid",
  "categoryId": "cat-003",
  "category": { "id": "cat-003", "name": "Insurance & Takaful", "slug": "insurance-takaful", "parentId": null },
  "subCategoryId": null,
  "subCategory": null,
  "status": "pending",
  "submittedBy": "user-abc123",
  "submitter": {
    "id": "user-abc123",
    "firstName": "Ahmed",
    "lastName": "Al-Rashid",
    "email": "ahmed@example.com"
  },
  "rejectionReason": null,
  "createdAt": "2024-12-10T14:22:00.000Z"
}
```

| Field | Type | Admin Only | Notes |
|-------|------|-----------|-------|
| `submitter` | `{ id, firstName, lastName, email } \| null` | ✅ | Full submitter profile |
| `rejectionReason` | `string \| null` | ✅ | Populated when status is `rejected` |

---

### Resources User Endpoints

#### GET /resources
List resources (user-visible, published only).

**Query Parameters:**
```
page          integer   default: 1
perPage       integer   default: 20, max: 100
search        string    Full-text search on title/topic/author
order         "ASC"|"DESC"  default: "DESC" (by publishedAt)
resourceType  "guide"|"research"|"standard"|"tool"
categoryId    string    UUID of ResourceCategory
isPremium     boolean
status        "published"  (users: always filtered to published)
```

**Response: 200 OK**
```json
{
  "data": [ /* ResourceItem[] */ ],
  "meta": { "page": 1, "perPage": 20, "itemCount": 87, "pageCount": 5, "hasPreviousPage": false, "hasNextPage": true }
}
```

---

#### GET /resources/:id
Get single resource.

**Response: 200 OK** → `ResourceItem`  
**Response: 404** → `{ "statusCode": 404, "message": "Resource not found" }`

---

#### GET /resources/categories
Get all categories (flat list with parentId relationships).

**Response: 200 OK** → `ResourceCategory[]`

---

#### GET /resources/glossary
Get glossary terms. Pass `?letter=M` to filter by first letter.

**Query Parameters:**
```
letter   string   Single letter A-Z for alphabetic filtering
```

**Response: 200 OK** → `GlossaryTerm[]`

---

#### GET /resources/glossary/:id
Get single glossary term.

**Response: 200 OK** → `GlossaryTerm`

---

#### POST /resources/:id/track-download
Track a download event (fire-and-forget). Increments `downloadCount`.

**Response: 204 No Content**

---

#### POST /resources/submissions
Submit a user-contributed resource for admin review.

**Request Body:**
```json
{
  "title": "Community Guide: Takaful Models",
  "briefIntro": "An overview of Shariah-compliant cooperative insurance.",
  "categoryId": "cat-003",
  "subCategoryId": null,
  "resourceType": "guide",
  "suggestedSubCategoryName": null,
  "suggestedDocTypeName": null,
  "fileUrl": "https://cdn.iefa.ng/uploads/sub-001.pdf",
  "coverImageUrl": "https://cdn.iefa.ng/uploads/sub-001-cover.jpg",
  "authorName": "Ahmed Al-Rashid"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | `string` | ✅ | |
| `briefIntro` | `string` | — | |
| `categoryId` | `string` | ✅ | Major category UUID |
| `subCategoryId` | `string` | — | Sub-category UUID |
| `resourceType` | `ResourceType` | — | |
| `suggestedSubCategoryName` | `string` | — | Free-text when "Other" selected for General resources |
| `suggestedDocTypeName` | `string` | — | Free-text when "Other" selected for Regulatory resources |
| `fileUrl` | `string` | ✅ | Must be a pre-uploaded URL |
| `coverImageUrl` | `string` | — | |
| `authorName` | `string` | — | |

**Response: 201 Created** → `UserResourceSubmission`

---

#### POST /file-upload/test
Upload a file (image or document).

**Request:** `multipart/form-data` with field `file`  
**Response: 200 OK**
```json
{ "url": "https://cdn.iefa.ng/uploads/filename.pdf" }
```

---

### Resources Admin Endpoints

> All admin endpoints require admin/staff role JWT.

#### GET /resources  *(admin)*
Same endpoint as user-facing. Admin receives all statuses (`draft`, `published`, `archived`).

**Additional admin query params:**
```
status   "draft"|"published"|"archived"
```

**Response: 200 OK** → `PaginatedResponse<AdminResource>`

---

#### AdminResource (extends ResourceItem)
The admin shape is identical to `ResourceItem` — no additional fields. Admin reads all statuses; users only see `published`.

---

#### POST /resources
Create a new resource.

**Request Body:**
```json
{
  "title": "CBN Circular: Capital Requirements for Islamic Banks",
  "resourceType": "standard",
  "authorName": "Central Bank of Nigeria",
  "authorType": "organization",
  "topic": "Regulatory Compliance",
  "briefIntro": "Outlines minimum capital adequacy requirements for non-interest financial institutions operating in Nigeria.",
  "coverImageUrl": "https://cdn.iefa.ng/resources/covers/cbn-circular-2024.jpg",
  "fileUrl": "https://cdn.iefa.ng/resources/files/cbn-circular-2024.pdf",
  "previewUrl": null,
  "categoryId": null,
  "isPremium": false,
  "isFeatured": false,
  "status": "published",
  "tags": [
    "major:regulatory",
    "reg-body:cbn",
    "doc-type:circulars-directives"
  ]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `title` | `string` | ✅ | |
| `resourceType` | `"guide"\|"research"\|"standard"\|"tool"` | ✅ | |
| `authorName` | `string` | — | |
| `authorType` | `"individual"\|"organization"` | — | |
| `topic` | `string` | — | |
| `briefIntro` | `string` | — | |
| `coverImageUrl` | `string` | — | Pre-uploaded URL |
| `fileUrl` | `string` | — | Pre-uploaded URL |
| `previewUrl` | `string` | — | Pre-uploaded URL |
| `categoryId` | `string` | — | UUID; used for General category resources |
| `isPremium` | `boolean` | — | Default `false` |
| `isFeatured` | `boolean` | — | Default `false` |
| `status` | `"draft"\|"published"\|"archived"` | — | Default `"draft"` |
| `tags` | `string[]` | — | See [Tag Convention](#tag-convention-resources) |

**Response: 201 Created** → `AdminResource`

---

#### PATCH /resources/:id
Partial update. Same body shape as POST, all fields optional.

**Response: 200 OK** → `AdminResource`

---

#### DELETE /resources/:id

**Response: 204 No Content**

---

#### GET /resources/categories  *(admin)*
Same as user endpoint. Returns full tree.

**Response: 200 OK** → `AdminResourceCategory[]`

---

#### POST /resources/categories
Create a category (or sub-category).

**Request Body:**
```json
{
  "name": "Sukuk & Capital Markets",
  "parentId": null
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | `string` | ✅ | |
| `parentId` | `string` | — | Omit or `null` = top-level category |

**Response: 201 Created** → `AdminResourceCategory`

---

#### PATCH /resources/categories/:id

**Request Body:** `{ "name": "Updated Name", "parentId": "cat-001" }` (all optional)  
**Response: 200 OK** → `AdminResourceCategory`

---

#### DELETE /resources/categories/:id

**Response: 204 No Content**

---

#### GET /resources/glossary  *(admin)*
Same as user endpoint but returns all statuses (draft + published).

**Response: 200 OK** → `AdminGlossaryTerm[]`

---

#### POST /resources/glossary
Create a glossary term.

**Request Body:**
```json
{
  "term": "Wakala",
  "definition": "An agency contract where one party appoints another to carry out a specific task on their behalf in exchange for a fee, commonly used in Islamic insurance and investment operations.",
  "letter": "W",
  "status": "published",
  "relatedTerms": ["Takaful", "Mudarabah"]
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `term` | `string` | ✅ | |
| `definition` | `string` | ✅ | |
| `letter` | `string` | — | Auto-derived from term if omitted |
| `status` | `"draft"\|"published"` | — | Default `"draft"` |
| `relatedTerms` | `string[]` | — | Term names (not IDs) |

**Response: 201 Created** → `AdminGlossaryTerm`

---

#### PATCH /resources/glossary/:id
Partial update. All fields optional.

**Response: 200 OK** → `AdminGlossaryTerm`

---

#### DELETE /resources/glossary/:id

**Response: 204 No Content**

---

#### GET /resources/submissions/pending
List user-submitted resources awaiting review.

**Response: 200 OK** → `PendingResourceSubmission[]`

---

#### POST /resources/submissions/:id/approve
Approve a pending submission. Promotes it to a published `AdminResource`.

**Response: 200 OK** → `PendingResourceSubmission` (with `status: "approved"`)

---

#### POST /resources/submissions/:id/reject
Reject a pending submission.

**Request Body:**
```json
{
  "reason": "File does not meet quality standards. Please re-submit with a higher resolution PDF."
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `reason` | `string` | — | Optional rejection note sent to submitter |

**Response: 200 OK** → `PendingResourceSubmission` (with `status: "rejected"`, `rejectionReason` populated)

---

---

## Learning Zone Module

> **Note:** The Learning Zone API is not yet live. This contract is designed to match the frontend UI in `LearningZone.tsx` and `AdminLearning.tsx`, following the established API patterns (pagination meta, status enums, tag system where applicable).

### Learning Zone Entities

#### Educator
```json
{
  "id": "edu-001",
  "userId": "user-xyz",
  "name": "Dr. Musa Al-Tijani",
  "email": "musa@iefa.ng",
  "bio": "PhD in Islamic Economics from IIUM. 15 years of industry experience in Islamic banking operations and Shariah advisory.",
  "profilePhotoUrl": "https://cdn.iefa.ng/educators/edu-001.jpg",
  "courseCount": 7,
  "studentCount": 3240,
  "rating": 4.8,
  "status": "approved",
  "joinedAt": "2023-06-01T00:00:00.000Z",
  "createdAt": "2023-06-01T00:00:00.000Z",
  "updatedAt": "2024-10-15T00:00:00.000Z"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | ✅ | UUID |
| `userId` | `string \| null` | — | Linked portal user account |
| `name` | `string` | ✅ | Display name |
| `email` | `string` | ✅ | Contact email |
| `bio` | `string \| null` | — | Full biography |
| `profilePhotoUrl` | `string \| null` | — | |
| `courseCount` | `number` | ✅ | Computed |
| `studentCount` | `number` | ✅ | Computed (total unique enrolled students) |
| `rating` | `number` | ✅ | 0.0–5.0, computed from course reviews |
| `status` | `"approved" \| "pending" \| "suspended"` | ✅ | |
| `joinedAt` | `string` | ✅ | ISO 8601 datetime |
| `createdAt` | `string` | ✅ | ISO 8601 datetime |
| `updatedAt` | `string` | ✅ | ISO 8601 datetime |

---

#### Course
```json
{
  "id": "crs-001",
  "title": "Certified Islamic Finance Professional (CIFP)",
  "slug": "certified-islamic-finance-professional",
  "description": "A comprehensive professional certification program covering Islamic banking, finance principles, investment strategies, and professional practice.",
  "coverImageUrl": "https://cdn.iefa.ng/courses/crs-001.jpg",
  "previewVideoUrl": "https://cdn.iefa.ng/videos/crs-001-preview.mp4",
  "educatorId": "edu-001",
  "educator": {
    "id": "edu-001",
    "name": "Dr. Musa Al-Tijani",
    "profilePhotoUrl": "https://cdn.iefa.ng/educators/edu-001.jpg",
    "rating": 4.8
  },
  "programmeId": "prog-001",
  "programme": null,
  "moduleCount": 8,
  "videoCount": 42,
  "totalDurationMinutes": 2400,
  "enrolledCount": 1850,
  "level": "advanced",
  "priceUsd": 299.00,
  "isFree": false,
  "rating": 4.9,
  "reviewCount": 312,
  "status": "active",
  "tags": ["islamic-banking", "shariah", "certification"],
  "publishedAt": "2024-01-15T08:00:00.000Z",
  "createdAt": "2023-12-01T00:00:00.000Z",
  "updatedAt": "2024-10-30T00:00:00.000Z"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | ✅ | UUID |
| `title` | `string` | ✅ | |
| `slug` | `string` | ✅ | URL-safe, unique |
| `description` | `string \| null` | — | Full course description |
| `coverImageUrl` | `string \| null` | — | |
| `previewVideoUrl` | `string \| null` | — | Free preview video |
| `educatorId` | `string` | ✅ | FK to Educator |
| `educator` | `Partial<Educator>` | — | Nested educator summary |
| `programmeId` | `string \| null` | — | FK if part of a Programme |
| `programme` | `Partial<Programme> \| null` | — | Nested programme summary |
| `moduleCount` | `number` | ✅ | Number of modules/chapters |
| `videoCount` | `number` | ✅ | Total video lessons |
| `totalDurationMinutes` | `number` | ✅ | Total content duration |
| `enrolledCount` | `number` | ✅ | Computed |
| `level` | `"beginner" \| "intermediate" \| "advanced"` | ✅ | |
| `priceUsd` | `number` | ✅ | In USD; `0` if free |
| `isFree` | `boolean` | ✅ | |
| `rating` | `number` | ✅ | 0.0–5.0 |
| `reviewCount` | `number` | ✅ | |
| `status` | `"active" \| "draft" \| "archived"` | ✅ | Only `active` visible to users |
| `tags` | `string[]` | ✅ | |
| `publishedAt` | `string \| null` | — | ISO 8601 datetime |
| `createdAt` | `string` | ✅ | |
| `updatedAt` | `string` | ✅ | |

---

#### CourseVideo
```json
{
  "id": "vid-001",
  "courseId": "crs-001",
  "course": {
    "id": "crs-001",
    "title": "Certified Islamic Finance Professional (CIFP)"
  },
  "title": "Module 4: Principles of Murabaha",
  "description": "A detailed walkthrough of cost-plus financing mechanics, accounting treatment, and real-world application.",
  "videoUrl": "https://cdn.iefa.ng/videos/vid-001.mp4",
  "thumbnailUrl": "https://cdn.iefa.ng/videos/vid-001-thumb.jpg",
  "durationSeconds": 1800,
  "orderIndex": 12,
  "viewCount": 5420,
  "isFree": false,
  "status": "published",
  "createdAt": "2024-01-20T00:00:00.000Z",
  "updatedAt": "2024-01-20T00:00:00.000Z"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | ✅ | UUID |
| `courseId` | `string` | ✅ | FK to Course |
| `course` | `Partial<Course>` | — | Nested course summary |
| `title` | `string` | ✅ | |
| `description` | `string \| null` | — | |
| `videoUrl` | `string` | ✅ | Streaming or direct URL |
| `thumbnailUrl` | `string \| null` | — | |
| `durationSeconds` | `number` | ✅ | Video length in seconds |
| `orderIndex` | `number` | ✅ | Sort order within course |
| `viewCount` | `number` | ✅ | Computed |
| `isFree` | `boolean` | ✅ | `true` = preview video, no enrollment required |
| `status` | `"published" \| "processing" \| "draft"` | ✅ | `processing` = uploading/transcoding in progress |
| `createdAt` | `string` | ✅ | |
| `updatedAt` | `string` | ✅ | |

---

#### Programme
```json
{
  "id": "prog-001",
  "title": "CIFP Professional Package",
  "slug": "cifp-professional-package",
  "description": "Full access to all CIFP courses, assessments, and the professional certification upon completion.",
  "coverImageUrl": "https://cdn.iefa.ng/programmes/prog-001.jpg",
  "courseCount": 8,
  "courseIds": ["crs-001", "crs-002", "crs-003"],
  "courses": [
    { "id": "crs-001", "title": "CIFP Module 1: Fundamentals", "level": "advanced", "totalDurationMinutes": 300 }
  ],
  "enrolledCount": 1850,
  "totalDurationMinutes": 2400,
  "level": "advanced",
  "priceUsd": 299.00,
  "isFree": false,
  "status": "active",
  "certificateTemplateUrl": "https://cdn.iefa.ng/certificates/prog-001-template.pdf",
  "createdAt": "2023-11-01T00:00:00.000Z",
  "updatedAt": "2024-10-01T00:00:00.000Z"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | ✅ | UUID |
| `title` | `string` | ✅ | |
| `slug` | `string` | ✅ | |
| `description` | `string \| null` | — | |
| `coverImageUrl` | `string \| null` | — | |
| `courseCount` | `number` | ✅ | Count of included courses |
| `courseIds` | `string[]` | ✅ | Ordered course IDs |
| `courses` | `Partial<Course>[]` | — | Nested course summaries |
| `enrolledCount` | `number` | ✅ | Computed |
| `totalDurationMinutes` | `number` | ✅ | Sum of all course durations |
| `level` | `"beginner" \| "intermediate" \| "advanced"` | ✅ | |
| `priceUsd` | `number` | ✅ | |
| `isFree` | `boolean` | ✅ | |
| `status` | `"active" \| "draft" \| "archived"` | ✅ | |
| `certificateTemplateUrl` | `string \| null` | — | PDF template used for issued certificates |
| `createdAt` | `string` | ✅ | |
| `updatedAt` | `string` | ✅ | |

---

#### LearningPath
```json
{
  "id": "path-001",
  "title": "Islamic Banking Fundamentals",
  "slug": "islamic-banking-fundamentals",
  "description": "A structured path guiding learners from foundational Islamic finance concepts to practical banking operations.",
  "coverImageUrl": "https://cdn.iefa.ng/paths/path-001.jpg",
  "courseCount": 5,
  "courseIds": ["crs-010", "crs-011", "crs-012", "crs-013", "crs-014"],
  "courses": [
    { "id": "crs-010", "title": "Introduction to Islamic Finance", "level": "beginner" }
  ],
  "enrolledCount": 920,
  "totalDurationMinutes": 1200,
  "level": "beginner",
  "priceUsd": 0.00,
  "isFree": true,
  "status": "active",
  "createdAt": "2024-02-01T00:00:00.000Z",
  "updatedAt": "2024-09-15T00:00:00.000Z"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | ✅ | UUID |
| `title` | `string` | ✅ | |
| `slug` | `string` | ✅ | |
| `description` | `string \| null` | — | |
| `coverImageUrl` | `string \| null` | — | |
| `courseCount` | `number` | ✅ | |
| `courseIds` | `string[]` | ✅ | Ordered course IDs |
| `courses` | `Partial<Course>[]` | — | |
| `enrolledCount` | `number` | ✅ | |
| `totalDurationMinutes` | `number` | ✅ | |
| `level` | `"beginner" \| "intermediate" \| "advanced"` | ✅ | |
| `priceUsd` | `number` | ✅ | |
| `isFree` | `boolean` | ✅ | |
| `status` | `"active" \| "draft" \| "archived"` | ✅ | |
| `createdAt` | `string` | ✅ | |
| `updatedAt` | `string` | ✅ | |

---

#### Assessment
```json
{
  "id": "asmt-001",
  "courseId": "crs-001",
  "course": {
    "id": "crs-001",
    "title": "Certified Islamic Finance Professional (CIFP)"
  },
  "title": "CIFP Module 4 Final Exam",
  "description": "Comprehensive exam covering Investment Planning & Portfolio Management under Islamic principles.",
  "type": "exam",
  "durationMinutes": 120,
  "maxAttempts": 3,
  "passingScore": 70,
  "questionCount": 60,
  "totalAttempts": 842,
  "avgScore": 74.5,
  "status": "active",
  "availableFrom": "2024-12-01T00:00:00.000Z",
  "dueAt": "2024-12-30T23:59:59.000Z",
  "createdAt": "2024-11-15T00:00:00.000Z",
  "updatedAt": "2024-11-15T00:00:00.000Z"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | ✅ | UUID |
| `courseId` | `string` | ✅ | FK to Course |
| `course` | `Partial<Course>` | — | |
| `title` | `string` | ✅ | |
| `description` | `string \| null` | — | |
| `type` | `"quiz" \| "exam" \| "assessment"` | ✅ | Quiz = short; Exam = graded final; Assessment = mid-point |
| `durationMinutes` | `number` | ✅ | Time limit; `0` = untimed |
| `maxAttempts` | `number` | ✅ | `0` = unlimited |
| `passingScore` | `number` | ✅ | Minimum % to pass |
| `questionCount` | `number` | ✅ | |
| `totalAttempts` | `number` | ✅ (admin) | Aggregate, admin-only |
| `avgScore` | `number` | ✅ (admin) | Aggregate, admin-only |
| `status` | `"active" \| "draft" \| "archived"` | ✅ | |
| `availableFrom` | `string \| null` | — | ISO 8601 datetime |
| `dueAt` | `string \| null` | — | ISO 8601 datetime |
| `createdAt` | `string` | ✅ | |
| `updatedAt` | `string` | ✅ | |

---

#### AssessmentResult
```json
{
  "id": "result-001",
  "userId": "user-abc123",
  "user": {
    "id": "user-abc123",
    "firstName": "Ibrahim",
    "lastName": "Shehu",
    "email": "ibrahim@example.com"
  },
  "assessmentId": "asmt-002",
  "assessment": {
    "id": "asmt-002",
    "title": "Islamic Banking Principles - Final Exam",
    "type": "exam",
    "courseId": "crs-002"
  },
  "enrollmentId": "enrol-001",
  "score": 92,
  "passed": true,
  "grade": "A",
  "attemptNumber": 1,
  "timeSpentMinutes": 95,
  "completedAt": "2024-12-15T14:30:00.000Z",
  "certificateId": "cert-001",
  "certificate": {
    "id": "cert-001",
    "certificateUrl": "https://cdn.iefa.ng/certificates/cert-001.pdf",
    "issuedAt": "2024-12-15T14:31:00.000Z"
  },
  "createdAt": "2024-12-15T14:30:00.000Z"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | ✅ | UUID |
| `userId` | `string` | ✅ | FK to User |
| `user` | `Partial<User>` | — | Admin-only |
| `assessmentId` | `string` | ✅ | FK to Assessment |
| `assessment` | `Partial<Assessment>` | — | |
| `enrollmentId` | `string \| null` | — | FK to Enrollment |
| `score` | `number` | ✅ | Percentage 0–100 |
| `passed` | `boolean` | ✅ | `score >= assessment.passingScore` |
| `grade` | `string` | ✅ | Letter grade (A, B+, C, D, F) |
| `attemptNumber` | `number` | ✅ | Which attempt (1, 2, 3…) |
| `timeSpentMinutes` | `number \| null` | — | |
| `completedAt` | `string` | ✅ | ISO 8601 datetime |
| `certificateId` | `string \| null` | — | FK to Certificate (if issued) |
| `certificate` | `Partial<Certificate> \| null` | — | |
| `createdAt` | `string` | ✅ | |

---

#### Certificate
```json
{
  "id": "cert-001",
  "userId": "user-abc123",
  "user": {
    "id": "user-abc123",
    "firstName": "Ibrahim",
    "lastName": "Shehu",
    "email": "ibrahim@example.com"
  },
  "programmeId": "prog-001",
  "programme": {
    "id": "prog-001",
    "title": "CIFP Professional Package"
  },
  "enrollmentId": "enrol-001",
  "assessmentResultId": "result-001",
  "certificateUrl": "https://cdn.iefa.ng/certificates/cert-001.pdf",
  "issuedAt": "2024-12-15T14:31:00.000Z",
  "expiresAt": null,
  "status": "issued",
  "createdAt": "2024-12-15T14:31:00.000Z",
  "updatedAt": "2024-12-15T14:31:00.000Z"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | ✅ | UUID |
| `userId` | `string` | ✅ | FK to User |
| `user` | `Partial<User>` | — | Admin-only |
| `programmeId` | `string` | ✅ | FK to Programme |
| `programme` | `Partial<Programme>` | — | |
| `enrollmentId` | `string` | ✅ | FK to Enrollment |
| `assessmentResultId` | `string \| null` | — | FK to AssessmentResult that triggered issuance |
| `certificateUrl` | `string \| null` | — | Generated PDF URL |
| `issuedAt` | `string` | ✅ | ISO 8601 datetime |
| `expiresAt` | `string \| null` | — | If certification has an expiry |
| `status` | `"issued" \| "pending" \| "revoked"` | ✅ | |
| `createdAt` | `string` | ✅ | |
| `updatedAt` | `string` | ✅ | |

---

#### Enrollment
```json
{
  "id": "enrol-001",
  "userId": "user-abc123",
  "itemType": "programme",
  "itemId": "prog-001",
  "programme": {
    "id": "prog-001",
    "title": "CIFP Professional Package",
    "coverImageUrl": "https://cdn.iefa.ng/programmes/prog-001.jpg",
    "courseCount": 8,
    "totalDurationMinutes": 2400
  },
  "progressPercent": 62,
  "currentCourseId": "crs-004",
  "currentLessonId": "vid-021",
  "completedLessonIds": ["vid-001", "vid-002", "vid-003"],
  "status": "active",
  "enrolledAt": "2024-06-15T10:00:00.000Z",
  "lastActivityAt": "2024-12-20T18:45:00.000Z",
  "completedAt": null
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | ✅ | UUID |
| `userId` | `string` | ✅ | FK to User |
| `itemType` | `"course" \| "programme" \| "learning_path"` | ✅ | Type of enrolled item |
| `itemId` | `string` | ✅ | FK to Course/Programme/LearningPath |
| `course` / `programme` / `learningPath` | `Partial<...>` | — | Nested summary depending on `itemType` |
| `progressPercent` | `number` | ✅ | 0–100 |
| `currentCourseId` | `string \| null` | — | Active course (for programmes/paths) |
| `currentLessonId` | `string \| null` | — | Last video/lesson accessed |
| `completedLessonIds` | `string[]` | ✅ | |
| `status` | `"active" \| "completed" \| "paused" \| "expired"` | ✅ | |
| `enrolledAt` | `string` | ✅ | ISO 8601 datetime |
| `lastActivityAt` | `string \| null` | — | |
| `completedAt` | `string \| null` | — | |

---

#### Payment (Transaction)
```json
{
  "id": "TXN-001842",
  "userId": "user-abc123",
  "user": {
    "id": "user-abc123",
    "firstName": "Ibrahim",
    "lastName": "Shehu",
    "email": "ibrahim@example.com"
  },
  "itemType": "programme",
  "itemId": "prog-001",
  "itemTitle": "CIFP Professional Package",
  "amountCents": 29900,
  "currency": "USD",
  "status": "completed",
  "paymentMethod": "card",
  "paymentProvider": "stripe",
  "cardLast4": "4242",
  "transactionRef": "pi_3QKtAXLkdIwHu7pn1fKz0vYA",
  "receiptUrl": "https://pay.stripe.com/receipts/TXN-001842",
  "paidAt": "2024-12-15T09:12:00.000Z",
  "createdAt": "2024-12-15T09:10:00.000Z",
  "updatedAt": "2024-12-15T09:12:00.000Z"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | ✅ | Unique transaction ID (e.g., `TXN-001842`) |
| `userId` | `string` | ✅ | FK to User |
| `user` | `Partial<User>` | — | Admin-only |
| `itemType` | `"course" \| "programme" \| "learning_path" \| "subscription"` | ✅ | |
| `itemId` | `string` | ✅ | FK to purchased entity |
| `itemTitle` | `string` | ✅ | Snapshot of item title at purchase time |
| `amountCents` | `number` | ✅ | Amount in smallest currency unit (e.g., cents for USD) |
| `currency` | `string` | ✅ | ISO 4217 code (`"USD"`, `"NGN"`) |
| `status` | `"completed" \| "pending" \| "refunded" \| "failed"` | ✅ | |
| `paymentMethod` | `string \| null` | — | `"card"`, `"bank_transfer"`, `"ussd"` |
| `paymentProvider` | `string \| null` | — | `"stripe"`, `"paystack"` |
| `cardLast4` | `string \| null` | — | Last 4 digits of card |
| `transactionRef` | `string \| null` | — | Provider's transaction reference |
| `receiptUrl` | `string \| null` | — | Link to downloadable receipt |
| `paidAt` | `string \| null` | — | ISO 8601 datetime |
| `createdAt` | `string` | ✅ | |
| `updatedAt` | `string` | ✅ | |

---

#### Subscription
```json
{
  "id": "sub-plan-001",
  "userId": "user-abc123",
  "planName": "CIFP Professional Package",
  "planType": "annual",
  "amountCents": 29900,
  "currency": "USD",
  "status": "active",
  "currentPeriodStart": "2024-06-15T00:00:00.000Z",
  "currentPeriodEnd": "2025-06-15T00:00:00.000Z",
  "cancelledAt": null,
  "createdAt": "2024-06-15T00:00:00.000Z",
  "updatedAt": "2024-06-15T00:00:00.000Z"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | `string` | ✅ | UUID |
| `userId` | `string` | ✅ | FK to User |
| `planName` | `string` | ✅ | Human-readable plan name |
| `planType` | `"monthly" \| "annual"` | ✅ | |
| `amountCents` | `number` | ✅ | |
| `currency` | `string` | ✅ | ISO 4217 |
| `status` | `"active" \| "cancelled" \| "expired" \| "past_due"` | ✅ | |
| `currentPeriodStart` | `string` | ✅ | ISO 8601 datetime |
| `currentPeriodEnd` | `string` | ✅ | ISO 8601 datetime |
| `cancelledAt` | `string \| null` | — | |
| `createdAt` | `string` | ✅ | |
| `updatedAt` | `string` | ✅ | |

---

### Learning Zone User Endpoints

#### GET /learning/enrollments
List the authenticated user's enrollments.

**Query Parameters:**
```
itemType   "course"|"programme"|"learning_path"
status     "active"|"completed"|"paused"|"expired"
page       integer  default: 1
perPage    integer  default: 20
```

**Response: 200 OK** → `PaginatedResponse<Enrollment>`

---

#### GET /learning/enrollments/:id
Get a single enrollment with full progress detail.

**Response: 200 OK** → `Enrollment`

---

#### POST /learning/enroll
Enroll the authenticated user in a course, programme, or learning path.

**Request Body:**
```json
{
  "itemType": "programme",
  "itemId": "prog-001"
}
```

**Response: 201 Created** → `Enrollment`  
**Response: 409 Conflict** → `{ "statusCode": 409, "message": "Already enrolled" }`

---

#### PATCH /learning/enrollments/:id/progress
Update lesson progress (called after completing a video).

**Request Body:**
```json
{
  "currentLessonId": "vid-022",
  "completedLessonId": "vid-021",
  "progressPercent": 64
}
```

**Response: 200 OK** → `Enrollment`

---

#### GET /courses
Browse all published courses.

**Query Parameters:**
```
page         integer
perPage      integer
search       string
level        "beginner"|"intermediate"|"advanced"
educatorId   string
programmeId  string
pathId       string
isFree       boolean
order        "ASC"|"DESC"  default: "DESC" (by publishedAt)
```

**Response: 200 OK** → `PaginatedResponse<Course>`

---

#### GET /courses/:id
Get full course detail including educator and video list.

**Response: 200 OK** → `Course` (with `educator` and `videos: CourseVideo[]`)

---

#### GET /learning/programmes
List published programmes.

**Query Parameters:** `page`, `perPage`, `search`, `level`, `isFree`  
**Response: 200 OK** → `PaginatedResponse<Programme>`

---

#### GET /learning/programmes/:id
Get programme detail including course list.

**Response: 200 OK** → `Programme` (with `courses: Partial<Course>[]`)

---

#### GET /learning/paths
List published learning paths.

**Query Parameters:** `page`, `perPage`, `search`, `level`, `isFree`  
**Response: 200 OK** → `PaginatedResponse<LearningPath>`

---

#### GET /learning/paths/:id
Get path detail including course list.

**Response: 200 OK** → `LearningPath` (with `courses: Partial<Course>[]`)

---

#### GET /learning/assessments
List assessments available to the authenticated user (enrolled courses only).

**Query Parameters:**
```
status   "upcoming"|"completed"|"overdue"
courseId  string
```

**Response: 200 OK** → `PaginatedResponse<Assessment>`

---

#### GET /learning/assessments/:id
Get assessment detail.

**Response: 200 OK** → `Assessment`

---

#### POST /learning/assessments/:id/attempt
Submit an assessment attempt.

**Request Body:**
```json
{
  "answers": [
    { "questionId": "q-001", "selectedOptionId": "opt-003" },
    { "questionId": "q-002", "selectedOptionId": "opt-007" }
  ],
  "timeSpentMinutes": 95
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `answers` | `{ questionId: string; selectedOptionId: string }[]` | ✅ | |
| `timeSpentMinutes` | `number` | — | |

**Response: 201 Created** → `AssessmentResult`  
**Response: 400** → `{ "message": "No attempts remaining" }`

---

#### GET /learning/results
List the authenticated user's assessment results.

**Query Parameters:** `page`, `perPage`, `courseId`, `assessmentId`, `passed`  
**Response: 200 OK** → `PaginatedResponse<AssessmentResult>`

---

#### GET /learning/certificates
List the authenticated user's earned certificates.

**Response: 200 OK** → `Certificate[]`

---

#### GET /learning/certificates/:id/download
Download certificate PDF. Returns a redirect or signed URL.

**Response: 302 Redirect** (to PDF URL)  
  — or —  
**Response: 200 OK**
```json
{ "url": "https://cdn.iefa.ng/certificates/cert-001.pdf" }
```

---

#### GET /learning/payments
List the authenticated user's payment history.

**Query Parameters:** `page`, `perPage`, `status`, `order`  
**Response: 200 OK** → `PaginatedResponse<Payment>`

---

#### GET /learning/payments/:id
Get single transaction detail.

**Response: 200 OK** → `Payment`

---

#### GET /learning/subscription
Get the authenticated user's active subscription.

**Response: 200 OK** → `Subscription | null`  
**Response: 404** → `{ "statusCode": 404, "message": "No active subscription" }`

---

#### GET /learning/announcements
Get announcements for enrolled courses.

**Response: 200 OK**
```json
[
  {
    "id": "ann-001",
    "courseId": "crs-001",
    "course": { "id": "crs-001", "title": "CIFP" },
    "title": "Instructor Update",
    "message": "Please review updated reading materials for Module 4 before the live session.",
    "publishedAt": "2024-12-18T08:00:00.000Z"
  }
]
```

---

#### GET /learning/upcoming-activities
Get upcoming live sessions and assessment deadlines for the authenticated user.

**Response: 200 OK**
```json
[
  {
    "id": "act-001",
    "type": "live_session",
    "title": "Live Session: Sukuk Structures",
    "scheduledAt": "2024-12-22T09:00:00.000Z",
    "joinUrl": "https://zoom.us/j/123456789",
    "courseId": "crs-001",
    "durationMinutes": 60
  },
  {
    "id": "act-002",
    "type": "assessment_deadline",
    "title": "Assessment Deadline: Module 4 Quiz",
    "dueAt": "2025-01-05T23:59:59.000Z",
    "assessmentId": "asmt-003",
    "courseId": "crs-001"
  }
]
```

---

### Learning Zone Admin Endpoints

> All admin endpoints require admin/staff role JWT. Base path: `/admin/learning/...` or use role-guarded access at shared paths.

#### GET /admin/courses
List all courses (all statuses).

**Query Parameters:** `page`, `perPage`, `search`, `status`, `educatorId`, `level`, `order`  
**Response: 200 OK** → `PaginatedResponse<Course>`

---

#### POST /admin/courses
Create a course.

**Request Body:**
```json
{
  "title": "Introduction to Takaful",
  "slug": "introduction-to-takaful",
  "description": "Foundational course on Islamic cooperative insurance principles and structures.",
  "coverImageUrl": "https://cdn.iefa.ng/courses/takaful-cover.jpg",
  "previewVideoUrl": null,
  "educatorId": "edu-002",
  "programmeId": null,
  "level": "beginner",
  "priceUsd": 129.00,
  "isFree": false,
  "status": "draft",
  "tags": ["takaful", "insurance", "beginner"]
}
```

**Response: 201 Created** → `Course`

---

#### PATCH /admin/courses/:id
Partial update. All fields optional.  
**Response: 200 OK** → `Course`

---

#### DELETE /admin/courses/:id
**Response: 204 No Content**

---

#### GET /admin/educators
List all educators.

**Query Parameters:** `page`, `perPage`, `search`, `status`, `order`  
**Response: 200 OK** → `PaginatedResponse<Educator>`

---

#### POST /admin/educators
Create an educator profile.

**Request Body:**
```json
{
  "name": "Dr. Aisha Bello",
  "email": "aisha.bello@edu.ng",
  "bio": "Senior lecturer in Islamic economics at Bayero University Kano.",
  "profilePhotoUrl": "https://cdn.iefa.ng/educators/aisha.jpg",
  "userId": null
}
```

**Response: 201 Created** → `Educator`

---

#### PATCH /admin/educators/:id
**Response: 200 OK** → `Educator`

---

#### PATCH /admin/educators/:id/approve
Approve a pending educator application.

**Response: 200 OK** → `Educator` (with `status: "approved"`)

---

#### DELETE /admin/educators/:id
**Response: 204 No Content**

---

#### GET /admin/videos
List all course videos.

**Query Parameters:** `page`, `perPage`, `search`, `courseId`, `status`, `order`  
**Response: 200 OK** → `PaginatedResponse<CourseVideo>`

---

#### POST /admin/videos
Create a video lesson.

**Request Body:**
```json
{
  "courseId": "crs-001",
  "title": "Module 4 Lesson 5: Principles of Ijarah",
  "description": "A deep dive into lease-based financing contracts.",
  "videoUrl": "https://cdn.iefa.ng/videos/ijarah-lesson5.mp4",
  "thumbnailUrl": "https://cdn.iefa.ng/videos/ijarah-lesson5-thumb.jpg",
  "durationSeconds": 720,
  "orderIndex": 22,
  "isFree": false,
  "status": "processing"
}
```

**Response: 201 Created** → `CourseVideo`

---

#### PATCH /admin/videos/:id
**Response: 200 OK** → `CourseVideo`

---

#### DELETE /admin/videos/:id
**Response: 204 No Content**

---

#### GET /admin/programmes
List all programmes.

**Query Parameters:** `page`, `perPage`, `search`, `status`, `level`, `order`  
**Response: 200 OK** → `PaginatedResponse<Programme>`

---

#### POST /admin/programmes
Create a programme.

**Request Body:**
```json
{
  "title": "ESG & Ethical Finance Program",
  "slug": "esg-ethical-finance",
  "description": "Master sustainable and ethical finance aligned with Islamic values and modern ESG frameworks.",
  "coverImageUrl": "https://cdn.iefa.ng/programmes/esg-cover.jpg",
  "courseIds": ["crs-020", "crs-021", "crs-022"],
  "level": "intermediate",
  "priceUsd": 299.00,
  "isFree": false,
  "status": "draft",
  "certificateTemplateUrl": null
}
```

**Response: 201 Created** → `Programme`

---

#### PATCH /admin/programmes/:id
**Response: 200 OK** → `Programme`

---

#### DELETE /admin/programmes/:id
**Response: 204 No Content**

---

#### GET /admin/learning-paths
List all learning paths.

**Query Parameters:** `page`, `perPage`, `search`, `status`, `level`, `order`  
**Response: 200 OK** → `PaginatedResponse<LearningPath>`

---

#### POST /admin/learning-paths
**Request Body:**
```json
{
  "title": "Professional Certification Track",
  "slug": "professional-certification-track",
  "description": "Complete path to CIFP professional certification.",
  "courseIds": ["crs-001", "crs-002", "crs-003"],
  "level": "advanced",
  "priceUsd": 0.00,
  "isFree": true,
  "status": "active"
}
```

**Response: 201 Created** → `LearningPath`

---

#### PATCH /admin/learning-paths/:id
**Response: 200 OK** → `LearningPath`

---

#### DELETE /admin/learning-paths/:id
**Response: 204 No Content**

---

#### GET /admin/assessments
List all assessments.

**Query Parameters:** `page`, `perPage`, `search`, `courseId`, `type`, `status`, `order`  
**Response: 200 OK** → `PaginatedResponse<Assessment>`

---

#### POST /admin/assessments
Create an assessment.

**Request Body:**
```json
{
  "courseId": "crs-001",
  "title": "CIFP Module 4 Final Exam",
  "description": "Comprehensive exam on Investment Planning.",
  "type": "exam",
  "durationMinutes": 120,
  "maxAttempts": 3,
  "passingScore": 70,
  "status": "active",
  "availableFrom": "2024-12-01T00:00:00.000Z",
  "dueAt": "2024-12-30T23:59:59.000Z"
}
```

**Response: 201 Created** → `Assessment`

---

#### PATCH /admin/assessments/:id
**Response: 200 OK** → `Assessment`

---

#### DELETE /admin/assessments/:id
**Response: 204 No Content**

---

#### GET /admin/results
List all assessment results across all users.

**Query Parameters:** `page`, `perPage`, `userId`, `assessmentId`, `courseId`, `passed`, `order`  
**Response: 200 OK** → `PaginatedResponse<AssessmentResult>`

---

#### GET /admin/certificates
List all issued certificates.

**Query Parameters:** `page`, `perPage`, `userId`, `programmeId`, `status`, `order`  
**Response: 200 OK** → `PaginatedResponse<Certificate>`

---

#### POST /admin/certificates/:id/revoke
Revoke an issued certificate.

**Request Body:** (optional) `{ "reason": "Integrity violation" }`  
**Response: 200 OK** → `Certificate` (with `status: "revoked"`)

---

#### GET /admin/payments
List all payment transactions.

**Query Parameters:** `page`, `perPage`, `userId`, `status`, `itemType`, `order`  
**Response: 200 OK** → `PaginatedResponse<Payment>`

---

#### GET /admin/lms-stats
Dashboard statistics for the LMS admin panel.

**Response: 200 OK**
```json
{
  "totalCourses": 63,
  "totalEducators": 14,
  "totalVideos": 312,
  "totalProgrammes": 8,
  "totalCertificates": 892,
  "totalLearningPaths": 4,
  "totalAssessments": 5,
  "totalRevenueUsd": 184000.00,
  "activeEnrollments": 2340,
  "completionRate": 0.68
}
```

---

---

## Enum Reference

### Resource Types
| Value | UI Label | Description |
|-------|----------|-------------|
| `guide` | Educational Guide | How-to guides, instructional content |
| `research` | Research Publication | Research papers, academic articles |
| `standard` | Standard & Governance | Regulatory standards, governance frameworks |
| `tool` | Tool & Template | Spreadsheets, calculators, practical templates |

### Resource Status
| Value | Visible To | Description |
|-------|-----------|-------------|
| `draft` | Admin only | Work in progress |
| `published` | Users + Admin | Publicly accessible |
| `archived` | Admin only | Removed from public; preserved for records |

### Regulatory Sub-categories: Regulatory Bodies (fixed)
These are the **4 fixed sub-categories** of the Regulatory major category. They are not `ResourceCategory` DB records — they are referenced via tag on each resource.

| Tag Value | Short Name | Full Name |
|-----------|-----------|-----------|
| `reg-body:cbn` | CBN | Central Bank of Nigeria |
| `reg-body:sec` | SEC | Securities and Exchange Commission |
| `reg-body:naicom` | NAICOM | National Insurance Commission |
| `reg-body:ndic` | NDIC | Nigeria Deposit Insurance Corporation |

### Regulatory Sub-sub-categories: Document Types (fixed)
These are the **fixed document type classifiers** sitting under each regulatory body (the sub-sub-category level of Regulatory). Also referenced via tag.

| Tag Value | Label |
|-----------|-------|
| `doc-type:circulars-directives` | Circulars & Directives |
| `doc-type:guidelines-frameworks` | Guidelines & Frameworks |
| `doc-type:notices-press-releases` | Notices & Press Releases |
| `doc-type:data-statistical-bulletins` | Data & Statistical Bulletins |
| `doc-type:communiques` | Communiqués |

When the document type is not listed above, use `doc-type-custom:<free-text>` tag instead.

### Course / Programme / Path Status
| Value | Visible To | Description |
|-------|-----------|-------------|
| `active` | Users + Admin | Live and enrollable |
| `draft` | Admin only | Being built |
| `archived` | Admin only | No longer offered |

### Assessment Types
| Value | Description |
|-------|-------------|
| `quiz` | Short knowledge check (< 20 mins, typically ungraded or low-stakes) |
| `exam` | Graded final examination (determines pass/fail for certificate) |
| `assessment` | Mid-point evaluation (progress checkpoint) |

### Grade Scale (suggested)
| Score Range | Grade |
|-------------|-------|
| 90–100% | A |
| 80–89% | B+ |
| 70–79% | B |
| 60–69% | C |
| 50–59% | D |
| < 50% | F |

---

## Tag Convention (Resources)

Resources use a structured `tags` array to encode metadata not represented by dedicated columns. All tags follow the format `namespace:value`.

| Prefix | Example | Meaning |
|--------|---------|---------|
| `major:general` | `"major:general"` | Resource belongs to the General major category |
| `major:regulatory` | `"major:regulatory"` | Resource belongs to the Regulatory major category |
| `reg-body:<id>` | `"reg-body:cbn"` | Regulatory body that published this document |
| `doc-type:<id>` | `"doc-type:circulars-directives"` | Regulatory document type classification |
| `doc-type-custom:<name>` | `"doc-type-custom:Special Circular"` | User-entered custom document type |
| `general-sub-custom:<name>` | `"general-sub-custom:Corporate Finance"` | User-entered custom sub-category for General |

**Rules:**
- Every resource must have exactly one `major:` tag.
- Regulatory resources must have at most one `reg-body:` tag and at most one `doc-type:` or `doc-type-custom:` tag.
- General resources with a known sub-category use `categoryId` — the tag is not required.
- General resources with an unknown sub-category use `general-sub-custom:` when `categoryId` is absent.

---

*Generated from frontend source analysis of `LearningZone.tsx`, `AdminLearning.tsx`, `Resources.tsx`, `AdminResources.tsx`, `types/resources.ts`, `hooks/useAdmin.ts`, and `hooks/useResources.ts`.*  
*Base URL: `https://iefa-project-api.onrender.com/api/v1`*
