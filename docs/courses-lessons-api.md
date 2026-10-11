# Courses & Lessons API — دليل الربط للفرونت

**Base URL:** `https://api.my-academy.online`

كل المسارات في هذا الملف تُضاف مباشرة بعد الـ Base URL (لا يوجد prefix مثل `/api`).

هذا الملف يغطي الكورسات والدروس للأدوار الثلاثة: الطالب (`STUDENT`)، المدرس صاحب الأكاديمية (`ACADEMY_ADMIN`)، والسوبر أدمن (`SUPER_ADMIN`)، ومعها رفع فيديو الدرس. قواعد المصادقة والكوكي موثّقة في [auth-api.md](./auth-api.md).

---

## 1. الفكرة العامة

- الأكاديمية (tenant) فيها **كورسات**، وكل كورس فيه **دروس**. الدرس يأخذ الـ tenant من الكورس ولا ينتقل لكورس آخر.
- كل المسارات هنا **تحتاج تسجيل دخول**، وما يرجع يختلف حسب الدور:

| الدور | ما يراه | ما يستطيع فعله |
| --- | --- | --- |
| `STUDENT` | الكورسات والدروس **المنشورة** في أكاديميته فقط | قراءة فقط. محتوى الدرس وفيديوه يفتحان بعد الاشتراك في الكورس |
| `ACADEMY_ADMIN` (المدرس) | كل كورسات ودروس أكاديميته بكل الحالات | إنشاء / تعديل / حذف + رفع الفيديو |
| `SUPER_ADMIN` | كل شيء في كل الأكاديميات | مثل المدرس، لأي أكاديمية |

- **الدرس لا يُنشأ بدون فيديو:** يُرفع الفيديو أولًا، يُسجَّل في جدول الـ media، ثم يُنشأ الدرس بالـ `mediaId` (القسم 5).
- الطالب يشترك في **الكورس** (وليس الدرس)، والاشتراك يفتح كل دروس الكورس.

### ملخص المسارات

| المسار | Method | `STUDENT` | `ACADEMY_ADMIN` | `SUPER_ADMIN` |
| --- | --- | :-: | :-: | :-: |
| `/courses` | `GET` | ✅ | ✅ | ✅ |
| `/courses/:id` | `GET` | ✅ | ✅ | ✅ |
| `/courses` | `POST` | — | ✅ | ✅ (مع `tenantId`) |
| `/courses/:id` | `PATCH` | — | ✅ | ✅ |
| `/courses/:id` | `DELETE` | — | ✅ | ✅ |
| `/lessons` | `GET` | ✅ | ✅ | ✅ |
| `/lessons/:id` | `GET` | ✅ (مشترك فقط) | ✅ | ✅ |
| `/lessons/:id/video` | `GET` | ✅ (مشترك فقط) | ✅ | ✅ |
| `/lessons/:id/video/key` | `GET` | ✅ (مشترك فقط) | ✅ | ✅ |
| `/lessons/video/upload-url` | `POST` | — | ✅ | ✅ |
| `/lessons/video` | `POST` | — | ✅ | ✅ |
| `/lessons` | `POST` | — | ✅ | ✅ |
| `/lessons/:id` | `PATCH` | — | ✅ | ✅ |
| `/lessons/:id` | `DELETE` | — | ✅ | ✅ |

---

## 2. قواعد عامة

### المصادقة

كل طلب يُرسل مع `credentials: 'include'` (أو `withCredentials: true` في axios). بدون جلسة يرجع `401`، ودور غير مسموح له يرجع `403`.

### القيم الثابتة (Enums)

| الحقل | القيم | الافتراضي |
| --- | --- | --- |
| `Course.status` | `DRAFT` / `PUBLISHED` / `ARCHIVED` | `DRAFT` |
| `Lesson.status` | `DRAFT` / `PUBLISHED` / `ARCHIVED` | `DRAFT` |

الطالب يرى الدرس فقط إذا كان الدرس `PUBLISHED` **و** كورسه `PUBLISHED`.

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
{ "statusCode": 404, "message": "الكورس رقم 9 غير موجود", "error": "Not Found" }
```

في أخطاء الـ validation (`400`) يكون `message` **مصفوفة** نصوص. الـ API يرفض أي حقل غير معرّف في الـ body، فلا ترسل حقولًا إضافية ولا `""` لحقل اختياري (احذف الحقل بدلًا من ذلك). الأرقام تُرسل كأرقام وليس نصوصًا.

| الكود | المعنى |
| --- | --- |
| `400` | بيانات غير صحيحة، أو فيديو غير موجود / لم يُرفع |
| `401` | غير مسجل الدخول |
| `403` | الدور غير مسموح، أو الطالب غير مشترك في الكورس، أو المستخدم غير مرتبط بأكاديمية |
| `404` | العنصر غير موجود **أو خارج ما يحق للمستخدم رؤيته** (كورس أكاديمية أخرى، أو درس غير منشور للطالب) |
| `409` | لا يمكن الحذف لوجود بيانات مرتبطة، أو الفيديو مستخدم في درس آخر |
| `503` | تخزين الفيديو غير مُعدّ في الباك |

---

## 3. الكورسات

### شكل الكورس

```json
{
  "id": 12,
  "tenantId": 3,
  "title": "أساسيات البرمجة",
  "description": "وصف الكورس",
  "imageUrl": "https://cdn.example.com/course.jpg",
  "status": "PUBLISHED",
  "order": 0,
  "createdAt": "2026-10-01T10:00:00.000Z",
  "updatedAt": "2026-10-05T12:30:00.000Z",
  "_count": { "lessons": 8, "exams": 1 }
}
```

`description` و `imageUrl` قد يكونان `null`. `_count.lessons` يحسب **كل** دروس الكورس بما فيها غير المنشورة، حتى للطالب.

### `GET /courses` — القائمة

| Query | النوع | ملاحظات |
| --- | --- | --- |
| `search` | string | يبحث في عنوان الكورس |
| `status` | enum | يُتجاهل للطالب (يرى `PUBLISHED` دائمًا) |
| `tenantId` | number | للـ `SUPER_ADMIN` فقط، ويُتجاهل لغيره |
| `page`, `limit` | number | |

الترتيب: `order` تصاعديًا ثم `id`. الرد بشكل الـ pagination و `data` مصفوفة كورسات.

### `GET /courses/:id` — كورس واحد

يرجع الكورس مباشرة (بدون غلاف). `404` إذا كان خارج نطاق المستخدم.

### `POST /courses` — إنشاء (المدرس / السوبر أدمن)

| الحقل | النوع | مطلوب | ملاحظات |
| --- | --- | :-: | --- |
| `title` | string | ✅ | أقصى 191 حرفًا |
| `description` | string | | |
| `imageUrl` | string | | رابط URL صحيح |
| `status` | enum | | الافتراضي `DRAFT` |
| `order` | number | | صحيح ≥ 0 |
| `tenantId` | number | للسوبر أدمن | **مطلوب للـ `SUPER_ADMIN`**، ويُتجاهل للمدرس (يُنشأ في أكاديميته دائمًا) |

**Response `201`:**

```json
{ "message": "تم إنشاء الكورس بنجاح", "course": { "id": 12, "...": "..." } }
```

أخطاء خاصة: `400` `معرّف المستأجر (tenantId) مطلوب` (سوبر أدمن بدون `tenantId`)، `404` `المستأجر رقم x غير موجود`.

### `PATCH /courses/:id` — تعديل / نشر

نفس حقول الإنشاء وكلها اختيارية، **ما عدا `tenantId`** (غير مسموح؛ الكورس لا ينتقل لأكاديمية أخرى). النشر: `{ "status": "PUBLISHED" }`.

```json
{ "message": "تم تحديث الكورس بنجاح", "course": { "id": 12, "...": "..." } }
```

### `DELETE /courses/:id` — حذف

```json
{ "message": "تم حذف الكورس بنجاح", "id": 12 }
```

يرجع `409` إذا كان للكورس دروس أو امتحانات أو اشتراكات أو أكواد اشتراك. في هذه الحالة اعرض على المستخدم **الأرشفة** بدل الحذف: `PATCH` بـ `{ "status": "ARCHIVED" }`.

---

## 4. الدروس

### شكل الدرس في القائمة (مختصر)

```json
{
  "id": 40,
  "tenantId": 3,
  "courseId": 12,
  "title": "المتغيرات",
  "description": "وصف قصير",
  "duration": 540,
  "order": 1,
  "status": "PUBLISHED",
  "createdAt": "2026-10-02T09:00:00.000Z",
  "updatedAt": "2026-10-02T09:00:00.000Z"
}
```

القائمة **لا ترجع** محتوى الدرس ولا الفيديو. `duration` بالثواني وقد يكون `null`.

للطالب فقط يُضاف حقل:

```json
{ "enrolled": true }
```

`enrolled: false` معناه أن الطالب غير مشترك في كورس هذا الدرس، فاعرض الدرس مقفولًا ولا تطلب تفاصيله.

### شكل الدرس التفصيلي

كل حقول القائمة، ومعها:

```json
{
  "content": "<p>نص الدرس</p>",
  "videoUrl": "/lessons/40/video",
  "videoId": "tenants/3/courses/12/videos/6f1c....mp4",
  "videoType": "BACKBLAZE",
  "mediaId": 77,
  "media": { "status": "READY" },
  "course": { "id": 12, "title": "أساسيات البرمجة" }
}
```

- `videoUrl` **مسار نسبي على الـ API** وليس رابطًا للتخزين. أضف قبله الـ Base URL وشغّله بمشغّل HLS (التفاصيل في `GET /lessons/:id/video` بالأسفل). يكون `null` إذا لم يكن للدرس فيديو.
- `media.status`: `PROCESSING` (الفيديو يُجهَّز ولا يمكن تشغيله بعد)، `READY` (جاهز)، `FAILED` (فشل التجهيز). `media` يكون `null` إذا لم يكن للدرس فيديو.
- `videoId` و `mediaId` للاستخدام الداخلي؛ الفرونت يحتاج `mediaId` فقط ليعرف الفيديو الحالي عند التعديل.
- `content` قد يكون `null`.

### `GET /lessons` — القائمة

| Query | النوع | ملاحظات |
| --- | --- | --- |
| `courseId` | number | دروس كورس معيّن (الاستخدام الأساسي) |
| `search` | string | يبحث في عنوان الدرس |
| `status` | enum | يُتجاهل للطالب |
| `page`, `limit` | number | |

الترتيب: `courseId` ثم `order` ثم `id`.

### `GET /lessons/:id` — درس واحد

يرجع الدرس التفصيلي مباشرة.

| الحالة | الرد |
| --- | --- |
| الطالب مشترك في الكورس | `200` |
| الطالب غير مشترك (أو اشتراكه ملغي) | `403` `أنت غير مسجل في هذا الكورس` |
| الدرس أو كورسه غير منشور (للطالب)، أو خارج الأكاديمية | `404` |

### `GET /lessons/:id/video` — تشغيل الفيديو (HLS مشفّر)

الفيديو مخزَّن كمقاطع HLS **مشفّرة** (AES-128). هذا المسار يرجع الـ playlist (`application/vnd.apple.mpegurl`)، وهو نفسه قيمة `videoUrl` في الدرس التفصيلي:

- المقاطع نفسها تُحمَّل **من Backblaze مباشرة** بروابط موقّعة داخل الـ playlist، ولا تمرّ على الـ API.
- مفتاح فكّ التشفير يأتي من `GET /lessons/:id/video/key` (المشغّل يطلبه تلقائيًا)، ولا يُعطى إلا لمستخدم مسجّل وله صلاحية على الدرس. روابط المقاطع وحدها لا تشغّل الفيديو.

التشغيل بـ [hls.js](https://github.com/video-dev/hls.js) (`npm i hls.js`):

```tsx
import Hls from 'hls.js';

const API = process.env.NEXT_PUBLIC_API_URL!;

useEffect(() => {
  const video = videoRef.current;
  if (!video || !lesson.videoUrl || lesson.media?.status !== 'READY') return;
  const src = `${API}${lesson.videoUrl}`;

  if (Hls.isSupported()) {
    const hls = new Hls({
      // الكوكي تُرسل لطلبات الـ API فقط (الـ playlist والمفتاح)، وليس لـ Backblaze.
      xhrSetup: (xhr, url) => {
        xhr.withCredentials = url.startsWith(API);
      },
    });
    hls.loadSource(src);
    hls.attachMedia(video);
    return () => hls.destroy();
  }
  // Safari على iPhone يشغّل HLS بدون مكتبة.
  video.src = src;
}, [lesson.videoUrl, lesson.media?.status]);

<video ref={videoRef} controls controlsList="nodownload" />
```

- **لا تضع** `crossOrigin` على عنصر الـ `<video>`.
- نفس صلاحيات `GET /lessons/:id`: `401` بدون جلسة، `403` لطالب غير مشترك، `404` إذا لم يكن الدرس متاحًا أو ليس له فيديو.
- `409` `الفيديو ما زال قيد المعالجة`: الفيديو لم يجهز بعد. `409` `تعذرت معالجة الفيديو`: فشل تجهيزه، ويحتاج المدرس إعادة تسجيله (`POST /lessons/video` بنفس الـ `key`) أو رفعه من جديد.
- الـ playlist والمفتاح يُطلبان مرة واحدة عند بدء التشغيل، وروابط المقاطع صالحة 12 ساعة، فانتهاء الجلسة أثناء المشاهدة لا يقطع الفيديو. إعادة تحميل الصفحة تحتاج جلسة سارية.

### `GET /lessons/:id/video/key` — مفتاح التشفير

يرجع 16 بايت (`application/octet-stream`). لا يُستدعى يدويًا: عنوانه مكتوب داخل الـ playlist والمشغّل يطلبه بنفسه. نفس صلاحيات وأخطاء المسار السابق.

### `POST /lessons` — إنشاء (المدرس / السوبر أدمن)

يُستدعى **بعد** رفع الفيديو وتسجيله (القسم 5).

| الحقل | النوع | مطلوب | ملاحظات |
| --- | --- | :-: | --- |
| `courseId` | number | ✅ | |
| `title` | string | ✅ | أقصى 191 حرفًا |
| `mediaId` | number | ✅ | الـ `media.id` الراجع من `POST /lessons/video` |
| `description` | string | | |
| `content` | string | | نص / HTML الدرس |
| `duration` | number | | بالثواني؛ إذا لم يُرسل تؤخذ مدة الفيديو المسجّلة |
| `order` | number | | صحيح ≥ 0 |
| `status` | enum | | الافتراضي `DRAFT` |

**Response `201`:**

```json
{ "message": "تم إنشاء الدرس بنجاح", "lesson": { "id": 40, "...": "..." } }
```

> `lesson.videoUrl` في رد الإنشاء يكون `null`. مسار التشغيل هو `/lessons/:id/video`، ويرجع جاهزًا في `GET /lessons/:id`.

| الخطأ | السبب |
| --- | --- |
| `404` `الكورس رقم x غير موجود` | الكورس غير موجود أو ليس في أكاديمية المدرس |
| `400` `الفيديو رقم x غير موجود. قم برفع الفيديو أولاً.` | الـ `mediaId` غير موجود، أو ليس فيديو، أو تابع لأكاديمية أخرى |
| `409` `الفيديو رقم x مستخدم بالفعل في الدرس رقم y` | الفيديو مستخدم في درس آخر (كل فيديو لدرس واحد) |

### `PATCH /lessons/:id` — تعديل / نشر / تغيير الفيديو

نفس حقول الإنشاء وكلها اختيارية، **ما عدا `courseId`** (غير مسموح).

- النشر: `{ "status": "PUBLISHED" }`.
- **تغيير الفيديو:** ارفع الفيديو الجديد وسجّله، ثم أرسل `{ "mediaId": <الجديد> }`. الفيديو القديم يُحذف تلقائيًا من التخزين.

```json
{ "message": "تم تحديث الدرس بنجاح", "lesson": { "id": 40, "videoUrl": "/lessons/40/video", "...": "..." } }
```

رد التعديل يحتوي الدرس التفصيلي كاملًا مع `videoUrl` جاهز. أخطاء الفيديو (`400` / `409`) مثل الإنشاء.

### `DELETE /lessons/:id` — حذف

```json
{ "message": "تم حذف الدرس بنجاح", "id": 40 }
```

يحذف الدرس وفيديوه. يرجع `409` إذا كان للدرس تقدّم طلاب أو امتحانات؛ اعرض **الأرشفة** بدلًا منه: `PATCH` بـ `{ "status": "ARCHIVED" }`.

---

## 5. رفع فيديو الدرس (المدرس / السوبر أدمن)

الفيديو يُرفع **من المتصفح مباشرة إلى التخزين** (Backblaze) وليس عبر الـ API، في 3 خطوات قبل إنشاء الدرس:

```
1. POST /lessons/video/upload-url   →  uploadUrl + key
2. PUT  <uploadUrl>  (الملف نفسه)    →  إلى Backblaze مباشرة
3. POST /lessons/video              →  media.id
4. POST /lessons  { mediaId, ... }  →  الدرس
```

### 5.1 `POST /lessons/video/upload-url`

| الحقل | النوع | مطلوب | ملاحظات |
| --- | --- | :-: | --- |
| `courseId` | number | ✅ | الكورس الذي سيُنشأ فيه الدرس |
| `fileName` | string | ✅ | اسم الملف الأصلي (`file.name`) |
| `contentType` | string | ✅ | يجب أن يبدأ بـ `video/` (`file.type`) |

**Response `201`:**

```json
{
  "uploadUrl": "https://s3.eu-central-003.backblazeb2.com/My-Academy/tenants/3/courses/12/videos/6f1c....mp4?X-Amz-...",
  "method": "PUT",
  "headers": { "Content-Type": "video/mp4" },
  "key": "tenants/3/courses/12/videos/6f1c....mp4",
  "expiresIn": 3600
}
```

الرابط صالح **ساعة واحدة**. `404` إذا كان الكورس خارج أكاديمية المدرس.

### 5.2 `PUT <uploadUrl>` — رفع الملف

طلب إلى Backblaze وليس إلى الـ API:

- الـ body هو الملف نفسه (ليس `FormData`).
- أرسل الـ `headers` الراجعة كما هي؛ `Content-Type` يجب أن يطابق ما أُرسل في الخطوة السابقة وإلا يُرفض الطلب.
- **بدون** `credentials` وبدون أي header إضافي.
- النجاح = `200`.

### 5.3 `POST /lessons/video` — تسجيل الفيديو

يتأكد أن الملف وصل فعلًا ثم يسجّله في جدول الـ media.

| الحقل | النوع | مطلوب | ملاحظات |
| --- | --- | :-: | --- |
| `key` | string | ✅ | الـ `key` الراجع من الخطوة 5.1 |
| `fileName` | string | | اسم الملف الأصلي للعرض |
| `duration` | number | | مدة الفيديو بالثواني (عدد صحيح) |

**Response `201`:**

```json
{
  "message": "تم حفظ الفيديو بنجاح",
  "media": {
    "id": 77,
    "tenantId": 3,
    "type": "VIDEO",
    "provider": "BACKBLAZE",
    "url": "https://s3.eu-central-003.backblazeb2.com/My-Academy/tenants/3/courses/12/videos/6f1c....mp4",
    "publicId": "tenants/3/courses/12/videos/6f1c....mp4",
    "fileName": "lesson-1.mp4",
    "mimeType": "video/mp4",
    "size": 104857600,
    "duration": 540,
    "status": "PROCESSING",
    "createdAt": "2026-10-07T17:00:00.000Z"
  }
}
```

- استخدم `media.id` كـ `mediaId` في إنشاء / تعديل الدرس. يمكن إنشاء الدرس مباشرة دون انتظار التجهيز.
- `media.status` يبدأ `PROCESSING`: الباك يحوّل الفيديو في الخلفية إلى HLS مشفّر، ثم يصبح `READY` (أو `FAILED`). تابع الحالة من `media.status` في `GET /lessons/:id`.
- `media.url` **ليس رابط تشغيل** (التخزين خاص). التشغيل دائمًا عبر `GET /lessons/:id/video`.
- استدعاء المسار مرتين بنفس الـ `key` يرجع نفس الصف، وإذا كانت حالته `FAILED` يعيد محاولة التجهيز.

| الخطأ | السبب |
| --- | --- |
| `400` `هذا المفتاح غير صالح` | `key` لم يصدر من الخطوة 5.1، أو تابع لأكاديمية أخرى |
| `400` `لم يتم رفع الفيديو بعد` | الرفع لم يكتمل أو فشل |

### مثال كامل (client)

```ts
const API = process.env.NEXT_PUBLIC_API_URL;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) throw await res.json();
  return res.json();
}

// fetch لا يعطي نسبة الرفع، لذلك نستخدم XMLHttpRequest.
function putFile(
  url: string,
  headers: Record<string, string>,
  file: File,
  onProgress?: (percent: number) => void,
) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    for (const [name, value] of Object.entries(headers)) {
      xhr.setRequestHeader(name, value);
    }
    xhr.upload.onprogress = (e) =>
      e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () =>
      xhr.status < 300 ? resolve() : reject(new Error('Upload failed'));
    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(file);
  });
}

function getVideoDuration(file: File) {
  return new Promise<number | undefined>((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(Number.isFinite(video.duration) ? Math.round(video.duration) : undefined);
    };
    video.onerror = () => resolve(undefined);
    video.src = URL.createObjectURL(file);
  });
}

// يرجع mediaId جاهزًا لإنشاء / تعديل الدرس.
export async function uploadLessonVideo(
  courseId: number,
  file: File,
  onProgress?: (percent: number) => void,
) {
  const upload = await api<UploadUrl>('/lessons/video/upload-url', {
    method: 'POST',
    body: JSON.stringify({ courseId, fileName: file.name, contentType: file.type }),
  });

  await putFile(upload.uploadUrl, upload.headers, file, onProgress);

  const duration = await getVideoDuration(file);
  const { media } = await api<{ media: Media }>('/lessons/video', {
    method: 'POST',
    body: JSON.stringify({ key: upload.key, fileName: file.name, duration }),
  });
  return media.id;
}

export const createLesson = (data: LessonInput) =>
  api<{ lesson: LessonDetail }>('/lessons', {
    method: 'POST',
    body: JSON.stringify(data),
  });
```

```ts
// شاشة إضافة درس
const mediaId = await uploadLessonVideo(courseId, file, setProgress);
await createLesson({ courseId, title, mediaId, status: 'DRAFT' });
```

---

## 6. تدفق كل دور

### الطالب

1. **صفحة الكورسات:** `GET /courses` (ترجع المنشور فقط).
2. **صفحة الكورس:** `GET /courses/:id` + `GET /lessons?courseId=:id&limit=100`.
3. كل درس فيه `enrolled`:
   - `true` → يفتح صفحة الدرس.
   - `false` → يظهر مقفولًا مع زر الاشتراك (إدخال كود: `POST /enrollments/redeem` بـ `{ "code": "..." }`).
4. **صفحة الدرس:** `GET /lessons/:id` ثم تشغيل `API_URL + lesson.videoUrl` بـ hls.js (راجع `GET /lessons/:id/video`) وعرض `content`.
   - `403` → الطالب غير مشترك، حوّله لصفحة الاشتراك.
   - `404` → الدرس غير متاح.

### المدرس (`ACADEMY_ADMIN`)

1. **قائمة الكورسات:** `GET /courses` مع فلتر `status` و `search`.
2. **إضافة كورس:** `POST /courses` (بدون `tenantId`).
3. **صفحة الكورس:** `GET /lessons?courseId=:id` لعرض دروسه بكل الحالات.
4. **إضافة درس:** رفع الفيديو (القسم 5) ثم `POST /lessons`. عطّل زر الحفظ حتى ينتهي الرفع.
5. **تعديل درس:** `GET /lessons/:id` لملء الفورم، ثم `PATCH /lessons/:id`. أرسل `mediaId` فقط إذا رفع المدرس فيديو جديدًا.
6. **النشر:** الدرس يظهر للطلاب عندما يكون الدرس **والكورس** `PUBLISHED`.
7. **الحذف:** عند `409` اعرض الأرشفة.

### السوبر أدمن

نفس شاشات المدرس مع فرقين:

- `POST /courses` **يجب** أن يحتوي `tenantId` (اختر الأكاديمية أولًا).
- `GET /courses` يقبل `?tenantId=` للفلترة بأكاديمية؛ بدونه ترجع كورسات كل الأكاديميات.

الدروس ورفع الفيديو لا تحتاج `tenantId`؛ الأكاديمية تُؤخذ من الكورس.

---

## 7. الـ Types

```ts
export type CourseStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type LessonStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Paginated<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface Course {
  id: number;
  tenantId: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  status: CourseStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
  _count: { lessons: number; exams: number };
}

export interface CourseInput {
  title: string;
  description?: string;
  imageUrl?: string;
  status?: CourseStatus;
  order?: number;
  tenantId?: number; // SUPER_ADMIN فقط، وفي الإنشاء فقط
}

export interface LessonSummary {
  id: number;
  tenantId: number;
  courseId: number;
  title: string;
  description: string | null;
  duration: number | null; // ثوانٍ
  order: number;
  status: LessonStatus;
  createdAt: string;
  updatedAt: string;
  enrolled?: boolean; // للطالب فقط
}

export interface LessonDetail extends Omit<LessonSummary, 'enrolled'> {
  content: string | null;
  videoUrl: string | null; // مسار نسبي على الـ API: /lessons/:id/video (HLS playlist)
  videoId: string | null;
  videoType: string | null;
  mediaId: number | null;
  media: { status: MediaStatus } | null;
  course: { id: number; title: string };
}

export interface LessonInput {
  courseId: number; // في الإنشاء فقط
  title: string;
  mediaId: number;
  description?: string;
  content?: string;
  duration?: number;
  order?: number;
  status?: LessonStatus;
}

export interface UploadUrl {
  uploadUrl: string;
  method: 'PUT';
  headers: Record<string, string>;
  key: string;
  expiresIn: number; // ثوانٍ
}

export type MediaStatus = 'PROCESSING' | 'READY' | 'FAILED';

export interface Media {
  id: number;
  tenantId: number;
  type: 'VIDEO';
  provider: 'BACKBLAZE';
  url: string;
  publicId: string;
  fileName: string | null;
  mimeType: string | null;
  size: number; // bytes
  duration: number | null;
  status: MediaStatus;
  createdAt: string;
}
```

---

## 8. قائمة تحقق

- [ ] كل الطلبات إلى الـ API تُرسل مع `credentials: 'include'`، وطلب الـ `PUT` إلى Backblaze **بدونها**.
- [ ] الفورم لا يرسل `""` ولا حقولًا إضافية، والأرقام (`courseId`, `mediaId`, `order`, `duration`) تُرسل كأرقام.
- [ ] السوبر أدمن يرسل `tenantId` عند إنشاء الكورس، والمدرس لا يرسله.
- [ ] لا يُرسل `tenantId` في تعديل الكورس ولا `courseId` في تعديل الدرس.
- [ ] إضافة الدرس: رفع الفيديو ← تسجيله ← إنشاء الدرس بالـ `mediaId`، مع شريط تقدّم.
- [ ] `Content-Type` في الـ `PUT` مطابق لما أُرسل في `upload-url`.
- [ ] الفيديو يُشغَّل بـ hls.js من الـ Base URL + `videoUrl`، و `withCredentials` لطلبات الـ API فقط، بدون `crossOrigin` على `<video>`.
- [ ] الدرس الذي `media.status` فيه ليس `READY` يعرض "الفيديو قيد التجهيز" بدل المشغّل.
- [ ] الطالب: الدروس التي `enrolled: false` تظهر مقفولة، و `403` من `GET /lessons/:id` يحوّل لصفحة الاشتراك.
- [ ] `409` عند الحذف يعرض خيار الأرشفة.
- [ ] `404` يُعامل كـ "غير موجود" سواء كان العنصر محذوفًا أو خارج صلاحية المستخدم.
