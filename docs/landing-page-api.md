# Landing Page API — دليل الربط للفرونت

**Base URL:** `https://api.my-academy.online`

كل المسارات في هذا الملف تُضاف مباشرة بعد الـ Base URL (لا يوجد prefix مثل `/api`).

هذا الملف يغطي صفحة الهبوط (Landing Page) لكل أكاديمية: المسار العام الذي يعرض الصفحة للزوار، ومسارات الإدارة (إنشاء / تعديل / حذف) من لوحة الـ Academy Admin. قواعد المصادقة والكوكي موثّقة في [auth-api.md](./auth-api.md).

---

## 1. الفكرة العامة

- كل أكاديمية لها **صفحة هبوط واحدة فقط** (علاقة 1:1 مع الـ Academy).
- الزائر يفتح `https://<slug>.my-academy.online`، والفرونت يستخرج الـ `slug` من الـ hostname ويطلب `GET /landing-page/<slug>`.
- هذا الطلب **عام** (بدون تسجيل دخول) ويرجع في رد واحد كل ما تحتاجه الصفحة: بيانات الأكاديمية، القالب (template)، محتوى صفحة الهبوط، والكورسات المنشورة.
- المحتوى لا يظهر للزوار إلا إذا كان `published: true`. غير ذلك يرجع `landingPage: null`.
- الإنشاء متاح فقط للأكاديميات على خطة `PRO`. خطة `BASIC` ترجع `403`.

| المسار | Method | الصلاحية | الاستخدام |
| --- | --- | --- | --- |
| `/landing-page/:slug` | `GET` | عام | عرض الصفحة للزوار |
| `/landing-page` | `GET` | `ACADEMY_ADMIN` / `SUPER_ADMIN` | جلب صفحة الأكاديمية في لوحة التحكم |
| `/landing-page` | `POST` | `ACADEMY_ADMIN` / `SUPER_ADMIN` | إنشاء الصفحة |
| `/landing-page/:id` | `PATCH` | `ACADEMY_ADMIN` / `SUPER_ADMIN` | تعديل الصفحة / النشر |
| `/landing-page/:id` | `DELETE` | `ACADEMY_ADMIN` / `SUPER_ADMIN` | حذف الصفحة |

> انتبه: المسار العام يستخدم الـ **slug**، أما التعديل والحذف فيستخدمان الـ **id الرقمي** لصفحة الهبوط (وليس id الأكاديمية).

---

## 2. الإعداد

```env
# .env للفرونت
NEXT_PUBLIC_API_URL=https://api.my-academy.online
```

- المسار العام لا يحتاج كوكي ولا `credentials`.
- مسارات الإدارة تحتاج الجلسة، فكل طلب يُرسل مع `credentials: 'include'` (أو `withCredentials: true` في axios).
- **CORS:** الـ API يقبل `https://my-academy.online` وأي نطاق فرعي `https://*.my-academy.online`. للتطوير المحلي (`http://localhost:3000`) يجب إضافة الـ origin في الباك في `CORS_ORIGINS`.

### استخراج الـ slug من الـ hostname

```ts
// ahmed.my-academy.online -> "ahmed"
export function getSlug(host: string): string | null {
  const hostname = host.split(':')[0];
  const match = hostname.match(/^([a-z0-9-]+)\.my-academy\.online$/);
  if (!match || match[1] === 'www' || match[1] === 'api') return null;
  return match[1];
}
```

محليًا لا يوجد subdomain، فاستخدم قيمة ثابتة من الـ env (مثل `NEXT_PUBLIC_DEV_SLUG=ahmed`) كبديل.

---

## 3. المسار العام — عرض الصفحة

### `GET /landing-page/:slug`

بدون مصادقة. `slug` هو الـ slug الخاص بالـ tenant (نفس الـ subdomain).

**Response `200`:**

```json
{
  "tenantId": 3,
  "academy": {
    "name": "أكاديمية أحمد",
    "description": "وصف الأكاديمية",
    "logoUrl": "https://cdn.example.com/logo.png",
    "phone": "01000000000",
    "email": "info@ahmed.com",
    "address": "القاهرة"
  },
  "template": {
    "type": "MODERN",
    "name": "Modern"
  },
  "landingPage": {
    "heroTitle": "تعلّم البرمجة من الصفر",
    "heroDescription": "كورسات عملية خطوة بخطوة",
    "heroImageUrl": "https://cdn.example.com/hero.jpg",
    "aboutTitle": "عن الأكاديمية",
    "aboutDescription": "نص التعريف",
    "instructorName": "أحمد علي",
    "instructorBio": "نبذة عن المحاضر",
    "instructorImage": "https://cdn.example.com/instructor.jpg",
    "qualifications": "بكالوريوس حاسبات",
    "experienceYears": 8,
    "features": [
      { "title": "دعم مباشر", "description": "رد خلال 24 ساعة" }
    ],
    "contactEmail": "contact@ahmed.com",
    "contactPhone": "01000000000",
    "contactAddress": "القاهرة",
    "footerText": "جميع الحقوق محفوظة"
  },
  "courses": [
    {
      "id": 12,
      "title": "أساسيات JavaScript",
      "description": "وصف الكورس",
      "imageUrl": "https://cdn.example.com/js.jpg",
      "order": 1
    }
  ]
}
```

### ملاحظات على الرد

- **`landingPage` قد تكون `null`**: إذا لم تُنشأ الصفحة بعد، أو كانت `published: false`. في هذه الحالة الرد ما زال `200` ومعه `academy` و `template` و `courses`، فاعرض صفحة افتراضية من بيانات الأكاديمية.
- **كل حقول `landingPage` قد تكون `null`** (كلها اختيارية). أخفِ أي section حقوله فارغة بدل عرض مكان فارغ.
- حقول `academy` (ما عدا `name`) قد تكون `null` أيضًا. استخدمها كـ fallback: مثلًا `landingPage.contactEmail ?? academy.email`.
- **`template.type`** يحدد تصميم الصفحة: `MODERN` | `EDUCATION` | `CORPORATE`. الفرونت يختار الـ component المناسب بناءً عليه.
- **`courses`** هي الكورسات بحالة `PUBLISHED` فقط، مرتبة تصاعديًا بـ `order`. قد تكون مصفوفة فارغة.
- **`features`** مصفوفة JSON حرة: الباك يتحقق فقط أنها مصفوفة ولا يفرض شكل العناصر. الشكل المقترح `{ title, description, icon? }`، والفرونت هو المسؤول عن الالتزام به عند الحفظ والقراءة.
- حقل `published` لا يرجع في المسار العام.

### الأخطاء

| الكود | الحالة | `message` |
| --- | --- | --- |
| `404` | الـ slug غير موجود | `Academy "<slug>" not found` |
| `404` | الـ tenant موجود بدون أكاديمية | `Tenant "<slug>" has no academy yet` |
| `403` | الأكاديمية `INACTIVE` أو `SUSPENDED` | `Academy "<slug>" is not available` |

### مثال (Next.js server component)

```tsx
// app/page.tsx
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getSlug } from '@/lib/slug';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getLanding(slug: string) {
  const res = await fetch(`${API_URL}/landing-page/${slug}`, {
    next: { revalidate: 60 },
  });
  if (res.status === 404) return null;
  if (res.status === 403) return { unavailable: true as const };
  if (!res.ok) throw new Error('Failed to load landing page');
  return res.json();
}

export default async function Page() {
  const host = (await headers()).get('host') ?? '';
  const slug = getSlug(host) ?? process.env.NEXT_PUBLIC_DEV_SLUG;
  if (!slug) notFound();

  const data = await getLanding(slug);
  if (!data) notFound();
  if ('unavailable' in data) return <AcademyUnavailable />;

  const { academy, template, landingPage, courses } = data;

  switch (template.type) {
    case 'EDUCATION':
      return <EducationTemplate {...{ academy, landingPage, courses }} />;
    case 'CORPORATE':
      return <CorporateTemplate {...{ academy, landingPage, courses }} />;
    default:
      return <ModernTemplate {...{ academy, landingPage, courses }} />;
  }
}
```

### الـ Types

```ts
export type TemplateType = 'MODERN' | 'EDUCATION' | 'CORPORATE';

export interface LandingPageContent {
  heroTitle: string | null;
  heroDescription: string | null;
  heroImageUrl: string | null;
  aboutTitle: string | null;
  aboutDescription: string | null;
  instructorName: string | null;
  instructorBio: string | null;
  instructorImage: string | null;
  qualifications: string | null;
  experienceYears: number | null;
  features: { title: string; description?: string; icon?: string }[] | null;
  contactEmail: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
  footerText: string | null;
}

export interface LandingPageResponse {
  tenantId: number;
  academy: {
    name: string;
    description: string | null;
    logoUrl: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
  };
  template: { type: TemplateType; name: string };
  landingPage: LandingPageContent | null;
  courses: {
    id: number;
    title: string;
    description: string | null;
    imageUrl: string | null;
    order: number;
  }[];
}
```

---

## 4. مسارات الإدارة (لوحة التحكم)

كلها تحتاج جلسة بدور `ACADEMY_ADMIN` أو `SUPER_ADMIN`، وتُرسل مع `credentials: 'include'`.

### حقول الـ body (للإنشاء والتعديل)

كل الحقول **اختيارية**.

| الحقل | النوع | القيود |
| --- | --- | --- |
| `heroTitle` | string | غير فارغ |
| `heroDescription` | string | غير فارغ |
| `heroImageUrl` | string | URL صحيح |
| `aboutTitle` | string | غير فارغ |
| `aboutDescription` | string | غير فارغ |
| `instructorName` | string | غير فارغ |
| `instructorBio` | string | غير فارغ |
| `instructorImage` | string | URL صحيح |
| `qualifications` | string | غير فارغ |
| `experienceYears` | number | عدد صحيح `>= 0` |
| `features` | array | مصفوفة (شكل العناصر حر) |
| `contactEmail` | string | بريد صحيح |
| `contactPhone` | string | — |
| `contactAddress` | string | — |
| `footerText` | string | — |
| `published` | boolean | الافتراضي `false` |

قواعد مهمة عند بناء الفورم:

- **لا ترسل string فارغ `""`** في الحقول المقيّدة بـ "غير فارغ" أو URL؛ سيرجع `400`. احذف الحقل من الـ body، أو أرسل `null` لمسح قيمته.
- **`experienceYears` رقم وليس نص**: `8` وليس `"8"`. حوّل قيمة الـ input قبل الإرسال.
- **أي حقل غير موجود في الجدول يرجع `400`** (مثل `id` أو `academyId` أو `createdAt`). لا ترسل الـ object الراجع من الـ GET كما هو؛ اختر الحقول المسموحة فقط.
- الصور تُرسل كـ URL جاهز، وهذا المسار لا يستقبل ملفات.

### `POST /landing-page` — إنشاء

الأكاديمية تؤخذ من جلسة المستخدم، فلا يُرسل `academyId`.

```json
{
  "heroTitle": "تعلّم البرمجة من الصفر",
  "heroDescription": "كورسات عملية خطوة بخطوة",
  "experienceYears": 8,
  "features": [{ "title": "دعم مباشر", "description": "رد خلال 24 ساعة" }],
  "published": false
}
```

**Response `201`:**

```json
{
  "message": "Landing page created successfully",
  "landingPage": {
    "id": 5,
    "academyId": 3,
    "heroTitle": "تعلّم البرمجة من الصفر",
    "published": false,
    "createdAt": "2026-10-05T10:00:00.000Z",
    "updatedAt": "2026-10-05T10:00:00.000Z"
  }
}
```

(`landingPage` ترجع بكل الحقول؛ المثال مختصر.)

| الكود | الحالة | `message` |
| --- | --- | --- |
| `409` | الأكاديمية لها صفحة بالفعل | `This academy already has a landing page` |
| `403` | الخطة `BASIC` | `Your current plan does not allow creating a landing page...` |
| `403` | المستخدم غير مرتبط بأكاديمية | `You are not assigned to an academy` |
| `404` | لا توجد أكاديمية للـ tenant | `Academy not found` |

> الإنشاء يعتمد على `tenantId` في الجلسة، فالـ `SUPER_ADMIN` غير المرتبط بأكاديمية يحصل على `403`. عمليًا الإنشاء يتم من حساب الـ `ACADEMY_ADMIN`.

### `GET /landing-page` — جلب الصفحة للوحة التحكم

يرجع **مصفوفة**:

- `ACADEMY_ADMIN`: عنصر واحد (صفحة أكاديميته) أو مصفوفة فارغة إذا لم تُنشأ بعد.
- `SUPER_ADMIN`: صفحات كل الأكاديميات.

```json
[
  {
    "id": 5,
    "academyId": 3,
    "heroTitle": "تعلّم البرمجة من الصفر",
    "published": false,
    "createdAt": "2026-10-05T10:00:00.000Z",
    "updatedAt": "2026-10-05T10:00:00.000Z",
    "academy": {
      "id": 3,
      "name": "أكاديمية أحمد",
      "tenant": { "slug": "ahmed" }
    }
  }
]
```

هذا هو المصدر للـ `id` المطلوب في التعديل والحذف، ولقيمة `published` الحالية (المسار العام لا يرجعهما).

### `PATCH /landing-page/:id` — تعديل / نشر

أرسل الحقول المراد تغييرها فقط.

```json
{ "heroTitle": "عنوان جديد", "published": true }
```

**Response `200`:**

```json
{ "message": "Landing page updated successfully" }
```

الرد لا يحتوي على البيانات المحدّثة؛ أعد طلب `GET /landing-page` أو حدّث الـ state محليًا.

### `DELETE /landing-page/:id` — حذف

**Response `200`:**

```json
{ "message": "Landing page deleted successfully" }
```

### أخطاء التعديل والحذف

| الكود | الحالة |
| --- | --- |
| `404` | الـ `id` غير موجود، أو يخص أكاديمية أخرى (`Landing page #<id> not found`) |
| `400` | الـ `id` ليس رقمًا، أو خطأ validation في الـ body |
| `401` | لا توجد جلسة أو انتهت |
| `403` | الدور غير مسموح |

### مثال (client)

```ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    // message is an array on validation errors
    const message = Array.isArray(body?.message)
      ? body.message.join('\n')
      : body?.message ?? 'Request failed';
    throw Object.assign(new Error(message), { status: res.status });
  }
  return body as T;
}

export const getMyLandingPage = async () =>
  (await api<LandingPageAdmin[]>('/landing-page'))[0] ?? null;

export const createLandingPage = (data: LandingPageInput) =>
  api('/landing-page', { method: 'POST', body: JSON.stringify(data) });

export const updateLandingPage = (id: number, data: LandingPageInput) =>
  api(`/landing-page/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteLandingPage = (id: number) =>
  api(`/landing-page/${id}`, { method: 'DELETE' });
```

```ts
export type LandingPageInput = Partial<LandingPageContent & { published: boolean }>;

export interface LandingPageAdmin extends LandingPageContent {
  id: number;
  academyId: number;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  academy: { id: number; name: string; tenant: { slug: string } };
}
```

### تدفق شاشة التعديل

1. عند فتح الشاشة: `GET /landing-page`.
2. مصفوفة فارغة → اعرض فورم الإنشاء، والحفظ يستدعي `POST /landing-page`. إذا رجع `403` بسبب الخطة اعرض رسالة ترقية الخطة.
3. يوجد عنصر → املأ الفورم منه، والحفظ يستدعي `PATCH /landing-page/:id`.
4. زر النشر / إلغاء النشر: `PATCH /landing-page/:id` بـ `{ "published": true | false }`.
5. رابط المعاينة: `https://<academy.tenant.slug>.my-academy.online`. الصفحة غير المنشورة تظهر للزوار بالمحتوى الافتراضي فقط.

---

## 5. قائمة تحقق

- [ ] `NEXT_PUBLIC_API_URL` مضبوط، والـ origin المحلي مضاف في `CORS_ORIGINS` في الباك.
- [ ] الـ slug يُستخرج من الـ subdomain مع بديل محلي.
- [ ] الصفحة العامة تتعامل مع `landingPage: null` ومع الحقول الـ `null`.
- [ ] `404` يعرض صفحة غير موجود، و `403` يعرض "الأكاديمية غير متاحة".
- [ ] اختيار القالب حسب `template.type`.
- [ ] طلبات الإدارة تُرسل مع `credentials: 'include'`.
- [ ] الفورم لا يرسل `""` ولا حقولًا إضافية، و `experienceYears` يُرسل كرقم.
- [ ] التعديل والحذف بالـ `id` الراجع من `GET /landing-page`.
- [ ] معالجة `409` (الصفحة موجودة) و `403` (خطة `BASIC`) عند الإنشاء.
