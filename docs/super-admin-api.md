# Super Admin API — دليل الربط للفرونت

**Base URL:** `https://api.my-academy.online`

كل المسارات في هذا الملف تُضاف مباشرة بعد الـ Base URL (لا يوجد prefix مثل `/api`).

مسارات المصادقة (تسجيل الطالب، تسجيل الدخول، تأكيد الـ OTP للطالب وللمالك) موثّقة في [auth-api.md](./auth-api.md).

---

## 1. قواعد عامة

### المصادقة

كل الـ endpoints هنا (ما عدا تسجيل الدخول وتأكيد الـ OTP) تحتاج جلسة مستخدم دوره `SUPER_ADMIN`.

المصادقة تعمل بـ **httpOnly cookie** (`access_token`) يضبطها `POST /auth/login`؛ التوكن لا يرجع في الـ body. يجب إرسال كل الطلبات مع credentials (`credentials: 'include'` في fetch أو `withCredentials: true` في axios). التفاصيل في [auth-api.md](./auth-api.md).

- الجلسة صلاحيتها **ساعة واحدة**، ولا يوجد refresh token. بعد انتهائها يرجع `401` ويجب إعادة تسجيل الدخول.
- جلسة بدور آخر ترجع `403`.

### شكل الأخطاء

```json
{
  "statusCode": 422,
  "message": "This academy already has an admin",
  "error": "Unprocessable Entity"
}
```

في أخطاء الـ validation (`400`) يكون `message` **مصفوفة** نصوص.

| الكود | المعنى |
|---|---|
| `400` | بيانات غير صالحة، أو حقل غير معروف في الـ body/query، أو `id` ليس رقمًا |
| `401` | الجلسة (الكوكي) مفقودة أو منتهية أو غير صحيحة |
| `403` | الدور ليس `SUPER_ADMIN`، أو الحساب موقوف |
| `404` | العنصر غير موجود |
| `409` | تعارض (slug أو email مستخدم) |
| `422` | العملية غير مسموحة في الحالة الحالية |

> إرسال أي حقل غير موثّق في الـ body أو الـ query يرجع `400`. أرسل الحقول المذكورة فقط.

### القيم الثابتة (Enums)

| النوع | القيم | المقابل في الواجهة |
|---|---|---|
| حالة الأكاديمية | `ACTIVE` / `INACTIVE` / `SUSPENDED` | نشطة / غير مفعّلة / موقوفة |
| حالة حساب المالك | `ACTIVE` / `INACTIVE` / `SUSPENDED` | نشط / بانتظار الدخول / موقوف |
| الخطة | `BASIC` / `PRO` | — |
| نوع القالب | `MODERN` / `EDUCATION` / `CORPORATE` | — |

### الـ Pagination

القوائم تقبل `page` (افتراضي `1`) و `limit` (افتراضي `10`، أقصى `100`)، وترجع:

```json
"meta": { "total": 7, "page": 1, "limit": 10, "totalPages": 1 }
```

---

## 2. تسجيل الدخول

### `POST /auth/login`

لا يحتاج جلسة.

```json
{ "email": "admin@example.com", "password": "secret123" }
```

`password` لا يقل عن 6 أحرف.

**201** — يضبط كوكي `access_token` (httpOnly)، ولا يوجد `token` في الـ body.

```json
{
  "message": "Login successful",
  "user": { "id": 1, "email": "admin@example.com", "role": "SUPER_ADMIN", "tenantId": null }
}
```

| الكود | الرسالة |
|---|---|
| `401` | `Invalid email or password` |
| `403` | `Your account is suspended` |

بعد الدخول: `GET /auth/me` يرجع المستخدم الحالي (للتحقق من الجلسة عند تحميل اللوحة)، و `POST /auth/logout` يمسح الكوكي. التفاصيل في [auth-api.md](./auth-api.md).

---

## 3. الإحصائيات (لوحة التحكم)

### `GET /academies/statistics`

**200**

```json
{
  "academies": {
    "total": 7,
    "active": 5,
    "inactive": 1,
    "suspended": 1,
    "activePercentage": 71
  },
  "owners": { "total": 8, "pendingFirstLogin": 2 },
  "students": { "total": 3375 },
  "courses": { "total": 23, "averagePerAcademy": 3 }
}
```

| الكارت | الحقل |
|---|---|
| إجمالي الأكاديميات | `academies.total` (+ `inactive` و `suspended` للسطر الفرعي) |
| الأكاديميات النشطة | `academies.active` و `academies.activePercentage` |
| ملّاك الأكاديميات | `owners.total` و `owners.pendingFirstLogin` |
| إجمالي الطلاب | `students.total` |
| إجمالي الدورات | `courses.total` و `courses.averagePerAcademy` |

---

## 4. الأكاديميات

### 4.1 `GET /academies` — القائمة

| Query | النوع | الوصف |
|---|---|---|
| `status` | `ACTIVE` \| `INACTIVE` \| `SUSPENDED` | فلتر التاب |
| `templateId` | رقم | فلتر القالب |
| `search` | نص | يبحث في اسم الأكاديمية، الـ slug، اسم المالك أو إيميله |
| `page` | رقم | افتراضي `1` |
| `limit` | رقم | افتراضي `10` |

مثال: `GET /academies?status=ACTIVE&search=ahmed&page=1`

**200**

```json
{
  "counts": { "all": 7, "active": 5, "inactive": 1, "suspended": 1 },
  "data": [
    {
      "id": 1,
      "name": "أكاديمية أحمد للبرمجة",
      "logoUrl": null,
      "createdAt": "2026-03-04T10:00:00.000Z",
      "template": { "id": 1, "name": "Modern Education", "type": "MODERN" },
      "tenantId": 1,
      "slug": "ahmed",
      "plan": "PRO",
      "status": "ACTIVE",
      "owner": { "id": 5, "name": "م. أحمد سامي", "email": "ahmed@example.com" }
    }
  ],
  "meta": { "total": 7, "page": 1, "limit": 10, "totalPages": 1 }
}
```

- `counts` تتأثر بـ `search` و `templateId` لكن **لا** تتأثر بـ `status`، لتبقى أرقام كل التابات ظاهرة.
- `owner` يكون `null` إذا لم يُضف مالك للأكاديمية بعد.
- النطاق الفرعي يُبنى في الفرونت من `slug`.
- `id` هو معرّف الأكاديمية ويُستخدم في كل مسارات `/academies/:id`. أما `tenantId` فيُستخدم فقط عند إضافة مالك (القسم 5.2).

### 4.2 `GET /academies/:id` — عرض التفاصيل

**200** — نفس حقول صف القائمة، مضافًا إليها:

```json
{
  "description": null,
  "phone": null,
  "email": null,
  "address": null,
  "updatedAt": "2026-03-04T10:00:00.000Z",
  "landingPage": { "id": 3, "published": true },
  "stats": { "courses": 4, "lessons": 32, "enrollments": 510, "students": 480 }
}
```

`landingPage` يكون `null` إذا لم تُنشأ صفحة هبوط. **404** إذا لم توجد الأكاديمية.

### 4.3 `POST /academies/:id` — تعديل

كل الحقول اختيارية؛ أرسل ما تريد تغييره فقط.

| الحقل | النوع | ملاحظات |
|---|---|---|
| `name` | نص | غير فارغ |
| `slug` | نص | حروف إنجليزية صغيرة وأرقام وشرطات فقط، حتى 63 حرفًا |
| `plan` | `BASIC` \| `PRO` | |
| `templateId` | رقم | |
| `description` | نص | |
| `logoUrl` | رابط | |
| `phone` | نص | |
| `email` | إيميل | إيميل تواصل الأكاديمية، وليس إيميل المالك |
| `address` | نص | |

**200**

```json
{ "message": "Academy updated successfully", "academy": { "...": "نفس شكل عرض التفاصيل" } }
```

| الكود | الحالة |
|---|---|
| `400` | `Template #<id> not found` أو خطأ validation |
| `404` | الأكاديمية غير موجودة |
| `409` | `Slug "<slug>" is already taken` |

### 4.4 `POST /academies/:id/activate` — تفعيل

بدون body.

```json
{ "message": "Academy activated successfully", "id": 1, "status": "ACTIVE" }
```

يعيد تفعيل حساب المالك الموقوف أيضًا.

### 4.5 `POST /academies/:id/suspend` — إيقاف

بدون body.

```json
{ "message": "Academy suspended successfully", "id": 1, "status": "SUSPENDED" }
```

يوقف حساب المالك في نفس العملية، فلا يستطيع تسجيل الدخول.

### 4.6 `DELETE /academies/:id` — حذف

```json
{ "message": "Academy deleted successfully", "id": 1 }
```

> **حذف نهائي لا يمكن التراجع عنه.** يحذف الأكاديمية وكل ما يتبعها: المالك، الطلاب، الدورات، الدروس، الامتحانات، الاشتراكات، الأكواد، الإشعارات، وصفحة الهبوط. يجب عرض نافذة تأكيد قبل الاستدعاء.

### 4.7 `POST /tenants/:template_id` — إنشاء أكاديمية

`template_id` في المسار هو رقم القالب.

```json
{ "name": "أكاديمية أحمد للبرمجة", "slug": "ahmed", "plan": "BASIC" }
```

`name` و `slug` مطلوبان، و `plan` اختياري (الافتراضي `BASIC`).

**201**

```json
{
  "message": "Tenant and academy created successfully",
  "tenant": {
    "id": 1,
    "name": "أكاديمية أحمد للبرمجة",
    "slug": "ahmed",
    "plan": "BASIC",
    "status": "ACTIVE",
    "createdAt": "...",
    "updatedAt": "...",
    "academy": { "id": 1, "name": "أكاديمية أحمد للبرمجة", "templateId": 1, "tenantId": 1, "template": { "id": 1, "name": "Modern Education", "type": "MODERN" } }
  }
}
```

أي فشل (slug مكرر، قالب غير موجود) يرجع `400` برسالة عامة: `Failed to create tenant and academy`.

---

## 5. ملّاك الأكاديميات

### 5.1 `GET /users/academy-admins` — القائمة

| Query | النوع | الوصف |
|---|---|---|
| `status` | `ACTIVE` \| `INACTIVE` \| `SUSPENDED` | حالة حساب المالك (`INACTIVE` = بانتظار الدخول) |
| `search` | نص | يبحث في اسم المالك، إيميله، أو اسم الأكاديمية |
| `page` | رقم | افتراضي `1` |
| `limit` | رقم | افتراضي `10` |

**200**

```json
{
  "counts": { "all": 7, "active": 5, "pending": 1, "suspended": 1 },
  "data": [
    {
      "id": 1,
      "name": "أكاديمية أحمد للبرمجة",
      "slug": "ahmed",
      "status": "ACTIVE",
      "academyAdmin": {
        "id": 5,
        "name": "م. أحمد سامي",
        "email": "ahmed@example.com",
        "status": "ACTIVE",
        "createdAt": "2026-03-04T10:00:00.000Z"
      }
    }
  ],
  "meta": { "total": 7, "page": 1, "limit": 10, "totalPages": 1 }
}
```

انتبه لشكل الصف:

- الصف هو **الأكاديمية** وبداخلها المالك. `id` و `name` و `slug` و `status` في المستوى الأعلى تخص الأكاديمية.
- بيانات المالك وحالة حسابه وتاريخ إنشائه داخل `academyAdmin`.
- **كل الإجراءات على المالك (5.3 – 5.6) تستخدم `academyAdmin.id`**، وليس `id` الصف.
- "عرض الأكاديمية" يستخدم `id` الصف مع `GET /academies/:id`.
- الأكاديميات التي ليس لها مالك لا تظهر في هذه القائمة، وكذلك المالك غير المرتبط بأكاديمية.
- `counts` تتأثر بـ `search` ولا تتأثر بـ `status`.

### 5.2 إضافة مالك (خطوتان)

**الخطوة 1 — `POST /users/add-academy-admin/:tenant_id`**

`tenant_id` هو `tenantId` الخاص بالأكاديمية (من قائمة الأكاديميات)، وليس `id` الأكاديمية.

```json
{ "name": "م. أحمد سامي", "email": "ahmed@example.com" }
```

**201**

```json
{ "message": "OTP sent to email. Please verify within 5 minutes." }
```

يُرسل OTP إلى إيميل المالك صالح لمدة 5 دقائق.

| الكود | الرسالة |
|---|---|
| `422` | `Tenant is not active or does not exist` |
| `422` | `This academy already has an admin` |
| `422` | `OTP already sent. Please verify within 5 minutes.` |

**الخطوة 2 — `POST /auth/academy-admin/verify-otp`**

لا يحتاج جلسة.

```json
{ "email": "ahmed@example.com", "otp": "123456" }
```

**201**

```json
{ "message": "email verified successfully, account created. Please check your email for login details." }
```

عند النجاح يُنشأ الحساب بحالة `INACTIVE` (بانتظار الدخول)، ويُربط بالأكاديمية، وتُرسل بيانات الدخول (الإيميل وكلمة مرور مولّدة) إلى إيميله. تتحول الحالة إلى `ACTIVE` تلقائيًا عند أول تسجيل دخول.

| الكود | الرسالة |
|---|---|
| `422` | `OTP has expired` |
| `422` | `Invalid OTP` |

> المالك لا يظهر في القائمة (5.1) إلا بعد نجاح الخطوة 2.

### 5.3 `POST /users/academy-admins/:id` — تعديل البيانات

`:id` = `academyAdmin.id`. الحقلان اختياريان.

```json
{ "name": "م. أحمد سامي", "email": "new@example.com" }
```

**200**

```json
{
  "message": "Academy admin updated successfully",
  "admin": {
    "id": 5,
    "name": "م. أحمد سامي",
    "email": "new@example.com",
    "status": "ACTIVE",
    "createdAt": "2026-03-04T10:00:00.000Z",
    "academy": { "id": 1, "name": "أكاديمية أحمد للبرمجة", "slug": "ahmed" }
  }
}
```

شكل `admin` هنا يختلف عن صف القائمة: المالك في المستوى الأعلى والأكاديمية بداخله (`academy` قد يكون `null`).

| الكود | الحالة |
|---|---|
| `404` | `Academy admin #<id> not found` |
| `409` | `Email "<email>" is already in use` |

### 5.4 `POST /users/academy-admins/:id/resend-invitation` — إعادة إرسال الدعوة

بدون body.

```json
{ "message": "Invitation resent successfully" }
```

يولّد كلمة مرور جديدة ويرسلها إلى إيميل المالك (القديمة تُلغى). متاح فقط إذا كانت حالة المالك `INACTIVE`؛ غير ذلك يرجع `422`:
`Invitation can only be resent to an admin who has not logged in yet`

اعرض هذا الإجراء فقط للصفوف التي `academyAdmin.status === "INACTIVE"`.

### 5.5 `POST /users/academy-admins/:id/suspend` — إيقاف الحساب

بدون body.

```json
{ "message": "Account suspended successfully", "id": 5, "status": "SUSPENDED" }
```

يوقف حساب المالك فقط؛ حالة الأكاديمية لا تتغير.

### 5.6 `POST /users/academy-admins/:id/activate` — تفعيل الحساب

بدون body.

```json
{ "message": "Account activated successfully", "id": 5, "status": "ACTIVE" }
```

إذا كانت أكاديمية المالك موقوفة يرجع `422`:
`The academy is suspended. Activate the academy to restore its admin.`
في هذه الحالة يجب تفعيل الأكاديمية نفسها (4.4).

---

## 6. ملخص المسارات

| # | Method | المسار | الوظيفة |
|---|---|---|---|
| 1 | `POST` | `/auth/login` | تسجيل الدخول |
| 2 | `GET` | `/academies/statistics` | إحصائيات لوحة التحكم |
| 3 | `GET` | `/academies` | قائمة الأكاديميات |
| 4 | `GET` | `/academies/:id` | تفاصيل أكاديمية |
| 5 | `POST` | `/academies/:id` | تعديل أكاديمية |
| 6 | `POST` | `/academies/:id/activate` | تفعيل أكاديمية |
| 7 | `POST` | `/academies/:id/suspend` | إيقاف أكاديمية |
| 8 | `DELETE` | `/academies/:id` | حذف أكاديمية |
| 9 | `POST` | `/tenants/:template_id` | إنشاء أكاديمية |
| 10 | `GET` | `/users/academy-admins` | قائمة الملّاك |
| 11 | `POST` | `/users/add-academy-admin/:tenant_id` | إضافة مالك (إرسال OTP) |
| 12 | `POST` | `/auth/academy-admin/verify-otp` | تأكيد OTP المالك |
| 13 | `POST` | `/users/academy-admins/:id` | تعديل بيانات مالك |
| 14 | `POST` | `/users/academy-admins/:id/resend-invitation` | إعادة إرسال الدعوة |
| 15 | `POST` | `/users/academy-admins/:id/suspend` | إيقاف حساب مالك |
| 16 | `POST` | `/users/academy-admins/:id/activate` | تفعيل حساب مالك |
| 17 | `GET` | `/auth/me` | المستخدم الحالي |
| 18 | `POST` | `/auth/logout` | تسجيل الخروج |

---

## 7. غير متاح حاليًا

- **قائمة القوالب:** لا يوجد endpoint يرجع القوالب لتعبئة فلتر "كل القوالب" أو اختيار القالب عند الإنشاء والتعديل. حاليًا يمكن معرفة القالب فقط من حقل `template` في صفوف الأكاديميات.
- **تفعيل أكاديمية "غير مفعّلة":** لا يوجد إجراء يحوّل الأكاديمية إلى `INACTIVE`؛ المتاح هو `activate` و `suspend` فقط.
- **طلاب الأكاديمية الموقوفة:** إيقاف الأكاديمية يمنع المالك من الدخول ويغلق صفحة الهبوط العامة، لكنه لا يمنع الطلاب من تسجيل الدخول.
- **Refresh token:** غير موجود؛ الجلسة تنتهي بعد ساعة ويجب إعادة تسجيل الدخول.
