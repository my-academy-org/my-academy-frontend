# Enrollment Codes & Enrollments API — دليل الربط للفرونت

**Base URL:** `https://api.my-academy.online`

كل المسارات في هذا الملف تُضاف مباشرة بعد الـ Base URL (لا يوجد prefix مثل `/api`).

هذا الملف يغطي **أكواد الاشتراك** (ينشئها المدرس ويوزّعها) و**الاشتراكات** (اشتراك الطالب في كورس) للأدوار الثلاثة: الطالب (`STUDENT`)، المدرس صاحب الأكاديمية (`ACADEMY_ADMIN`)، والسوبر أدمن (`SUPER_ADMIN`). قواعد المصادقة والكوكي موثّقة في [auth-api.md](./auth-api.md)، والكورسات والدروس في [courses-lessons-api.md](./courses-lessons-api.md).

---

## 1. الفكرة العامة

- الطالب يشترك في **الكورس**، والاشتراك يفتح كل دروسه. للاشتراك طريقتان:
  1. **بكود:** المدرس ينشئ أكوادًا لكورس معيّن، يعطي الطالب كودًا، والطالب يُدخله (`POST /enrollments/redeem`).
  2. **يدويًا:** المدرس يشترك للطالب مباشرة بدون كود (`POST /enrollments`).
- **الكود لكورس واحد ولطالب واحد ولمرة واحدة.** بعد استخدامه يصبح `USED` نهائيًا ولا يرجع متاحًا، حتى لو أُلغي الاشتراك أو حُذف.
- للطالب **اشتراك واحد فقط في كل كورس**. إذا أُلغي اشتراكه ثم اشترك من جديد، يُعاد تفعيل نفس الاشتراك (نفس الـ `id`) ولا يُنشأ اشتراك ثانٍ.
- عدد الأكواد محدود **بباقة الأكاديمية** (القسم 3).

| الدور | الأكواد | الاشتراكات |
| --- | --- | --- |
| `STUDENT` | لا يصل لها إطلاقًا (`403`) | يرى اشتراكاته فقط، ويشترك بكود |
| `ACADEMY_ADMIN` (المدرس) | كل أكواد أكاديميته: إنشاء / تعطيل / حذف | كل اشتراكات أكاديميته: اشتراك يدوي / تعديل الحالة / حذف |
| `SUPER_ADMIN` | مثل المدرس، لأي أكاديمية، وبدون حد الباقة | مثل المدرس، لأي أكاديمية |

### ملخص المسارات

| المسار | Method | `STUDENT` | `ACADEMY_ADMIN` | `SUPER_ADMIN` |
| --- | --- | :-: | :-: | :-: |
| `/enrollment-codes` | `POST` | — | ✅ | ✅ |
| `/enrollment-codes` | `GET` | — | ✅ | ✅ |
| `/enrollment-codes/:id` | `GET` | — | ✅ | ✅ |
| `/enrollment-codes/:id` | `PATCH` | — | ✅ | ✅ |
| `/enrollment-codes/:id` | `DELETE` | — | ✅ | ✅ |
| `/enrollments/redeem` | `POST` | ✅ | — | — |
| `/enrollments` | `POST` | — | ✅ | ✅ |
| `/enrollments` | `GET` | ✅ (اشتراكاته فقط) | ✅ | ✅ |
| `/enrollments/:id` | `GET` | ✅ (اشتراكاته فقط) | ✅ | ✅ |
| `/enrollments/:id` | `PATCH` | — | ✅ | ✅ |
| `/enrollments/:id` | `DELETE` | — | ✅ | ✅ |

---

## 2. قواعد عامة

### المصادقة

كل طلب يُرسل مع `credentials: 'include'` (أو `withCredentials: true` في axios). بدون جلسة يرجع `401`، ودور غير مسموح له يرجع `403`.

### القيم الثابتة (Enums)

| الحقل | القيم | الافتراضي |
| --- | --- | --- |
| `EnrollmentCode.status` | `AVAILABLE` / `USED` / `DISABLED` | `AVAILABLE` |
| `Enrollment.status` | `ACTIVE` / `COMPLETED` / `CANCELLED` | `ACTIVE` |

- `AVAILABLE`: الكود صالح للاستخدام. `USED`: استخدمه طالب. `DISABLED`: عطّله المدرس ولا يُقبل حتى يعيد تفعيله.
- `ACTIVE`: الطالب مشترك. `COMPLETED`: أنهى الكورس. `CANCELLED`: الاشتراك ملغي والدروس مقفولة عليه.

### الـ Pagination

كل القوائم تقبل `page` (افتراضي `1`) و `limit` (افتراضي `10`، أقصى `100`) وترجع:

```json
{
  "data": [],
  "meta": { "total": 42, "page": 1, "limit": 10, "totalPages": 5 }
}
```

### شكل الأخطاء

```json
{ "statusCode": 409, "message": "كود التسجيل لم يعد صالحاً", "error": "Conflict" }
```

- **كل الرسائل بالعربية** ويمكن عرضها للمستخدم مباشرة. لا تقارن نص الرسالة في الكود؛ اعتمد على `statusCode`.
- في أخطاء الـ validation (`400`) يكون `message` **مصفوفة** نصوص، مثل `["count يجب ألا يزيد عن 50"]`. اسم الحقل يبقى بالإنجليزية.
- الـ API يرفض أي حقل غير معرّف في الـ body، والأرقام تُرسل كأرقام وليس نصوصًا.

| الكود | المعنى |
| --- | --- |
| `400` | بيانات غير صحيحة |
| `401` | غير مسجل الدخول |
| `403` | الدور غير مسموح، أو تجاوز حد الباقة، أو المستخدم غير مرتبط بأكاديمية |
| `404` | العنصر غير موجود **أو خارج ما يحق للمستخدم رؤيته** (كود أو اشتراك في أكاديمية أخرى) |
| `409` | الكود مستخدم / معطّل، أو الطالب مشترك بالفعل، أو الكورس غير منشور |

---

## 3. أكواد الاشتراك (المدرس / السوبر أدمن)

### شكل الكود

```json
{
  "id": 501,
  "tenantId": 3,
  "code": "K7MPX2RTQ9",
  "status": "USED",
  "usedAt": "2026-10-09T18:20:00.000Z",
  "createdAt": "2026-10-08T10:00:00.000Z",
  "course": { "id": 12, "title": "أساسيات البرمجة" },
  "student": { "id": 88, "name": "أحمد علي", "email": "ahmed@example.com" }
}
```

- `code`: 10 خانات، حروف إنجليزية كبيرة وأرقام، **بدون** `0` `O` `1` `I` `L` حتى لا تختلط عند الكتابة باليد.
- `student` و `usedAt` يكونان `null` ما دام الكود لم يُستخدم.

### حد الباقة

| الباقة | أقصى عدد أكواد للأكاديمية |
| --- | :-: |
| `BASIC` | 100 |
| `PRO` | 1000 |

- الحد على **إجمالي** أكواد الأكاديمية في كل الكورسات، وتُحسب فيه كل الحالات (`AVAILABLE` و `USED` و `DISABLED`).
- حذف كود غير مستخدم **يرجّع مكانه** في الرصيد. الكود المستخدم لا يُحذف، فهو محسوب دائمًا.
- إذا كان الطلب سيتجاوز الحد **يُرفض كله** بـ `403` ولا يُنشأ أي كود. مثال: عنده 80 وطلب 50 في `BASIC` → يُرفض، ولا يُنشأ الـ 20 المتبقية تلقائيًا.
- الحد **لا يُطبَّق على `SUPER_ADMIN`**.

### `POST /enrollment-codes` — إنشاء أكواد

| الحقل | النوع | مطلوب | ملاحظات |
| --- | --- | :-: | --- |
| `courseId` | number | ✅ | الكورس الذي تفتحه الأكواد. يُقبل الكورس بأي حالة (حتى `DRAFT`) |
| `count` | number | ✅ | عدد الأكواد في هذا الطلب: صحيح من `1` إلى `50` |

الأكاديمية تُؤخذ من الكورس، فلا يُرسل `tenantId` حتى من السوبر أدمن.

**Response `201`:**

```json
{
  "message": "تم إنشاء أكواد التسجيل بنجاح",
  "enrollmentCodes": [
    {
      "id": 501,
      "tenantId": 3,
      "code": "K7MPX2RTQ9",
      "status": "AVAILABLE",
      "usedAt": null,
      "createdAt": "2026-10-08T10:00:00.000Z",
      "course": { "id": 12, "title": "أساسيات البرمجة" },
      "student": null
    }
  ],
  "existingCount": 60,
  "remaining": 40,
  "limit": 100
}
```

- `enrollmentCodes`: الأكواد التي أُنشئت في هذا الطلب فقط.
- `existingCount`: إجمالي أكواد الأكاديمية **بعد** هذا الطلب. `limit`: حد الباقة. `remaining`: المتبقي (`limit - existingCount`، وأقل قيمة له `0`).
- استخدم الثلاثة لعرض "استخدمت 60 من 100". لا يوجد مسار مستقل يرجّعها، فهي تأتي مع الإنشاء فقط.

| الخطأ | السبب |
| --- | --- |
| `400` | `count` خارج `1`–`50`، أو ليس رقمًا صحيحًا، أو `courseId` ناقص |
| `403` `لقد وصلت إلى الحد الأقصى لأكواد التسجيل المسموح بها في باقتك BASIC، والبالغ 100 كود.` | الطلب سيتجاوز حد الباقة (حتى لو بقي رصيد أقل من المطلوب) |
| `404` `الكورس رقم x غير موجود` | الكورس غير موجود أو ليس في أكاديمية المدرس |

### `GET /enrollment-codes` — القائمة

| Query | النوع | ملاحظات |
| --- | --- | --- |
| `courseId` | number | أكواد كورس معيّن |
| `status` | enum | `AVAILABLE` / `USED` / `DISABLED` |
| `search` | string | يبحث في نص الكود |
| `tenantId` | number | للـ `SUPER_ADMIN` فقط، ويُتجاهل لغيره |
| `page`, `limit` | number | |

الترتيب: الأحدث أولًا. الرد بشكل الـ pagination و `data` مصفوفة أكواد.

### `GET /enrollment-codes/:id` — كود واحد

يرجع الكود مباشرة (بدون غلاف). `404` `كود التسجيل رقم x غير موجود` إذا كان خارج نطاق المستخدم.

### `PATCH /enrollment-codes/:id` — تعطيل / إعادة تفعيل

| الحقل | النوع | مطلوب | ملاحظات |
| --- | --- | :-: | --- |
| `status` | enum | ✅ | `AVAILABLE` أو `DISABLED` فقط |

`USED` لا تُرسل؛ الكود يصبح `USED` عندما يستخدمه طالب فقط. لا يمكن تغيير الكورس ولا نص الكود.

```json
{ "message": "تم تحديث كود التسجيل بنجاح", "enrollmentCode": { "id": 501, "status": "DISABLED", "...": "..." } }
```

| الخطأ | السبب |
| --- | --- |
| `400` | `status` ليست `AVAILABLE` أو `DISABLED` |
| `404` `كود التسجيل رقم x غير موجود` | الكود غير موجود أو في أكاديمية أخرى |
| `409` `كود التسجيل مستخدم بالفعل ولا يمكن تعديله` | الكود `USED` |

### `DELETE /enrollment-codes/:id` — حذف

```json
{ "message": "تم حذف كود التسجيل بنجاح", "id": 501 }
```

يرجع `409` `كود التسجيل مستخدم بالفعل ولا يمكن حذفه` إذا كان الكود `USED`؛ الكود المستخدم يبقى كسجل لمن استخدمه. أخفِ زر الحذف والتعديل للأكواد المستخدمة.

---

## 4. الاشتراكات

### شكل الاشتراك

```json
{
  "id": 70,
  "tenantId": 3,
  "status": "ACTIVE",
  "enrolledAt": "2026-10-09T18:20:00.000Z",
  "completedAt": null,
  "course": { "id": 12, "title": "أساسيات البرمجة", "imageUrl": "https://cdn.example.com/course.jpg" },
  "student": { "id": 88, "name": "أحمد علي", "email": "ahmed@example.com" },
  "enrollmentCode": { "id": 501, "code": "K7MPX2RTQ9" }
}
```

- `enrollmentCode` يكون `null` في الاشتراك اليدوي (بدون كود).
- `completedAt` له قيمة فقط عندما تكون الحالة `COMPLETED`.
- `course.imageUrl` قد يكون `null`.

### `POST /enrollments/redeem` — الطالب يشترك بكود

| الحقل | النوع | مطلوب | ملاحظات |
| --- | --- | :-: | --- |
| `code` | string | ✅ | المسافات في أول وآخر النص تُحذف تلقائيًا |

الطالب لا يرسل `courseId`؛ الكورس يُعرف من الكود. الكود يجب أن يكون من **أكاديمية الطالب نفسها**.

**Response `201`:**

```json
{ "message": "تم التسجيل في الكورس بنجاح", "enrollment": { "id": 70, "...": "..." } }
```

بعد النجاح حوّل الطالب إلى الكورس: `enrollment.course.id`.

| الخطأ | السبب | ما يُعرض للطالب |
| --- | --- | --- |
| `404` `كود التسجيل غير صحيح` | الكود غير موجود، أو تابع لأكاديمية أخرى | الكود غير صحيح، راجع الكتابة |
| `409` `كود التسجيل لم يعد صالحاً` | الكود `USED` أو `DISABLED` | الكود مستخدم أو موقوف، اطلب كودًا آخر |
| `409` `هذا الكورس غير متاح` | كورس الكود ليس `PUBLISHED` | الكورس لم يُنشر بعد |
| `409` `الطالب مسجل بالفعل في هذا الكورس` | الطالب مشترك في الكورس (`ACTIVE` أو `COMPLETED`) | أنت مشترك بالفعل |

- في حالات الخطأ **الكود لا يُستهلك** ويبقى `AVAILABLE`، ومنها حالة "مشترك بالفعل".
- إذا كان اشتراك الطالب `CANCELLED` فالكود الجديد **يعيد تفعيله**: نفس الـ `id`، الحالة `ACTIVE`، و `enrollmentCode` يصبح الكود الجديد. الكود القديم يبقى `USED`.

### `POST /enrollments` — اشتراك يدوي (المدرس / السوبر أدمن)

| الحقل | النوع | مطلوب | ملاحظات |
| --- | --- | :-: | --- |
| `studentId` | number | ✅ | يجب أن يكون طالبًا في **نفس أكاديمية الكورس** |
| `courseId` | number | ✅ | يُقبل الكورس بأي حالة |

لا يستهلك كودًا ولا يدخل في حد الباقة.

**Response `201`:**

```json
{ "message": "تم تسجيل الطالب بنجاح", "enrollment": { "id": 71, "enrollmentCode": null, "...": "..." } }
```

| الخطأ | السبب |
| --- | --- |
| `404` `الكورس رقم x غير موجود` | الكورس غير موجود أو ليس في أكاديمية المدرس |
| `404` `الطالب رقم x غير موجود` | المستخدم غير موجود، أو ليس طالبًا، أو في أكاديمية أخرى |
| `409` `الطالب مسجل بالفعل في هذا الكورس` | له اشتراك `ACTIVE` أو `COMPLETED` (الاشتراك `CANCELLED` يُعاد تفعيله) |

### `GET /enrollments` — القائمة

| Query | النوع | ملاحظات |
| --- | --- | --- |
| `courseId` | number | اشتراكات كورس معيّن |
| `studentId` | number | يُتجاهل للطالب (يرى اشتراكاته فقط دائمًا) |
| `status` | enum | `ACTIVE` / `COMPLETED` / `CANCELLED` |
| `page`, `limit` | number | |

الترتيب: الأحدث اشتراكًا أولًا. الرد بشكل الـ pagination و `data` مصفوفة اشتراكات.

- **الطالب:** `GET /enrollments` هي صفحة "كورساتي". تشمل الاشتراكات الملغاة أيضًا، ففلتر بـ `?status=ACTIVE` إذا أردت النشطة فقط.
- **السوبر أدمن:** لا يوجد فلتر `tenantId` هنا؛ فلتر بـ `courseId`.

### `GET /enrollments/:id` — اشتراك واحد

يرجع الاشتراك مباشرة (بدون غلاف). `404` `التسجيل رقم x غير موجود` إذا كان خارج نطاق المستخدم (ومنه اشتراك طالب آخر).

### `PATCH /enrollments/:id` — تعديل الحالة (المدرس / السوبر أدمن)

| الحقل | النوع | مطلوب | ملاحظات |
| --- | --- | :-: | --- |
| `status` | enum | ✅ | `ACTIVE` / `COMPLETED` / `CANCELLED` |

الطالب والكورس لا يتغيّران. `COMPLETED` تضبط `completedAt` على وقت الطلب، وأي حالة أخرى ترجّعه `null`.

```json
{ "message": "تم تحديث التسجيل بنجاح", "enrollment": { "id": 70, "status": "CANCELLED", "...": "..." } }
```

**إلغاء الاشتراك** = `{ "status": "CANCELLED" }`: تُقفل الدروس على الطالب، ويستطيع الرجوع بكود جديد أو باشتراك يدوي.

### `DELETE /enrollments/:id` — حذف (المدرس / السوبر أدمن)

```json
{ "message": "تم حذف التسجيل بنجاح", "id": 70 }
```

يحذف الاشتراك نهائيًا. الكود الذي اشترك به الطالب **يبقى `USED`** ولا يرجع متاحًا. للإيقاف المؤقت استخدم الإلغاء (`CANCELLED`) بدل الحذف.

---

## 5. تدفق كل دور

### الطالب

1. الدرس الذي `enrolled: false` يظهر مقفولًا مع حقل إدخال الكود (راجع [courses-lessons-api.md](./courses-lessons-api.md)).
2. **إدخال الكود:** `POST /enrollments/redeem` بـ `{ "code": "..." }`.
   - `201` → حوّله للكورس `enrollment.course.id` وأعد تحميل الدروس.
   - `404` / `409` → اعرض `message` كما هي تحت الحقل.
3. **كورساتي:** `GET /enrollments?status=ACTIVE`.

```ts
async function redeemCode(code: string) {
  const res = await fetch(`${API_URL}/enrollments/redeem`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code: code.trim().toUpperCase() }),
  });
  const body = await res.json();
  if (!res.ok) {
    // message نص، أو مصفوفة نصوص في أخطاء الـ validation
    throw new Error([body.message].flat().join('\n'));
  }
  return body.enrollment as Enrollment;
}
```

### المدرس (`ACADEMY_ADMIN`)

1. **صفحة أكواد الكورس:** `GET /enrollment-codes?courseId=:id` مع فلتر `status` و `search`.
2. **إنشاء أكواد:** `POST /enrollment-codes` بـ `{ courseId, count }`. اعرض الأكواد الراجعة للنسخ أو الطباعة، وحدّث عدّاد الرصيد من `existingCount` / `limit` / `remaining`.
   - أكثر من 50 كودًا = أكثر من طلب.
   - `403` → اعرض `message` مع اقتراح ترقية الباقة.
3. **تعطيل كود ضائع أو مسرَّب:** `PATCH /enrollment-codes/:id` بـ `{ "status": "DISABLED" }`.
4. **حذف كود:** `DELETE /enrollment-codes/:id` (للأكواد غير المستخدمة فقط).
5. **طلاب الكورس:** `GET /enrollments?courseId=:id`.
6. **اشتراك يدوي / إلغاء:** `POST /enrollments` و `PATCH /enrollments/:id`.

### السوبر أدمن

نفس شاشات المدرس مع فرقين:

- `GET /enrollment-codes` يقبل `?tenantId=` للفلترة بأكاديمية؛ بدونه ترجع أكواد كل الأكاديميات.
- إنشاء الأكواد لا يتقيّد بحد الباقة. الرد يرجّع `existingCount` و `limit` و `remaining` كما هي، وقد يكون `remaining` صفرًا مع نجاح الطلب.

---

## 6. الـ Types

```ts
export type EnrollmentCodeStatus = 'AVAILABLE' | 'USED' | 'DISABLED';
export type EnrollmentStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface EnrollmentCode {
  id: number;
  tenantId: number;
  code: string;
  status: EnrollmentCodeStatus;
  usedAt: string | null;
  createdAt: string;
  course: { id: number; title: string };
  student: { id: number; name: string; email: string } | null;
}

export interface CreateEnrollmentCodesInput {
  courseId: number;
  count: number; // 1 - 50
}

export interface CreateEnrollmentCodesResponse {
  message: string;
  enrollmentCodes: EnrollmentCode[];
  existingCount: number; // إجمالي أكواد الأكاديمية بعد الطلب
  remaining: number;
  limit: number; // حد الباقة: 100 أو 1000
}

export interface UpdateEnrollmentCodeInput {
  status: 'AVAILABLE' | 'DISABLED';
}

export interface Enrollment {
  id: number;
  tenantId: number;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt: string | null;
  course: { id: number; title: string; imageUrl: string | null };
  student: { id: number; name: string; email: string };
  enrollmentCode: { id: number; code: string } | null;
}

export interface RedeemInput {
  code: string;
}

export interface CreateEnrollmentInput {
  studentId: number;
  courseId: number;
}

export interface UpdateEnrollmentInput {
  status: EnrollmentStatus;
}

export interface ApiError {
  statusCode: number;
  message: string | string[]; // مصفوفة في أخطاء الـ validation
  error: string;
}
```

---

## 7. قائمة تحقق

- [ ] كل الطلبات تُرسل مع `credentials: 'include'`.
- [ ] الأرقام (`courseId`, `studentId`, `count`) تُرسل كأرقام، ولا تُرسل حقول إضافية.
- [ ] رسائل الخطأ تُعرض من `message` كما هي، والمنطق يعتمد على `statusCode` وليس نص الرسالة.
- [ ] `message` يُعامل كنص أو مصفوفة نصوص.
- [ ] حقل الكود: `trim` + تحويل لحروف كبيرة قبل الإرسال.
- [ ] `count` في الفورم بين `1` و `50`.
- [ ] عدّاد رصيد الأكواد يُحدَّث من رد الإنشاء (`existingCount` / `limit` / `remaining`).
- [ ] `403` عند إنشاء الأكواد يعرض الرسالة مع اقتراح ترقية الباقة.
- [ ] أزرار التعديل والحذف مخفية للأكواد `USED`، و `PATCH` لا يرسل `USED`.
- [ ] صفحات الأكواد غير ظاهرة للطالب.
- [ ] "كورساتي" للطالب تستخدم `?status=ACTIVE`.
- [ ] إيقاف طالب = `CANCELLED` وليس الحذف.
- [ ] `404` يُعامل كـ "غير موجود" سواء كان العنصر محذوفًا أو خارج صلاحية المستخدم.
