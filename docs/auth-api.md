# Auth API — دليل الربط للفرونت

**Base URL:** `https://api.my-academy.online`

كل المسارات في هذا الملف تُضاف مباشرة بعد الـ Base URL (لا يوجد prefix مثل `/api`).

هذا الملف يغطي مسارات المصادقة: تسجيل الطالب، تسجيل الدخول، وتأكيد الـ OTP للطالب ولمالك الأكاديمية (Academy Admin). مسارات لوحة الـ Super Admin موثّقة في [super-admin-api.md](./super-admin-api.md).

---

## 1. قواعد عامة

### المصادقة

المصادقة تعمل بـ **httpOnly cookie**. التوكن لا يرجع في الـ body ولا يستطيع الـ JavaScript قراءته، فلا يُخزَّن في `localStorage` ولا يُرسل في header.

- `POST /auth/login` يضبط كوكي باسم `access_token` (`HttpOnly`، `Secure` في الـ production، `SameSite=Lax`، `Path=/`، `Domain=.my-academy.online`).
- الكوكي مضبوطة على `.my-academy.online`، فتصل إلى الـ API وإلى تطبيق الفرونت على أي نطاق فرعي (`ahmed.my-academy.online`).
- المتصفح يرسل الكوكي تلقائيًا، بشرط أن **كل** طلب للـ API يُرسل مع credentials:

```js
// fetch
fetch(url, { credentials: 'include' });

// axios
axios.create({ baseURL, withCredentials: true });
```

- الجلسة صلاحيتها **ساعة واحدة**، ولا يوجد refresh token. بعد انتهائها يرجع `401` ويجب إعادة تسجيل الدخول.
- لمعرفة المستخدم الحالي (مثلًا بعد refresh للصفحة) استخدم `GET /auth/me`، ولتسجيل الخروج `POST /auth/logout`.
- كل الـ endpoints في هذا الملف لا تحتاج جلسة، ما عدا `GET /auth/me`.

### Next.js (السيرفر)

`credentials: 'include'` يعمل في المتصفح فقط. في الـ server components والـ route handlers والـ server actions يجب تمرير الكوكي يدويًا:

```ts
import { cookies } from 'next/headers';

const res = await fetch(`${API_URL}/auth/me`, {
  headers: { Cookie: (await cookies()).toString() },
  cache: 'no-store',
});
```

- في الـ `middleware` يمكن التحقق من وجود الجلسة بـ `request.cookies.has('access_token')` لحماية الصفحات. وجود الكوكي لا يعني أنها صالحة؛ التحقق الفعلي يكون باستدعاء `GET /auth/me`.
- تسجيل الدخول والخروج يجب أن يُستدعيا **من المتصفح** مباشرة إلى الـ API، ليستقبل المتصفح الـ `Set-Cookie`. لو استُدعيا من السيرفر (server action) فلن تُضبط الكوكي في المتصفح إلا إذا نُقلت يدويًا.
- لا تقرأ ولا تكتب `access_token` من كود الـ client؛ هي غير مرئية للـ JavaScript.

> **CORS:** الـ API يقبل الطلبات بالكوكي من `https://my-academy.online` وأي نطاق فرعي `https://*.my-academy.online`. أي origin آخر (مثل `http://localhost:3000`) يجب إضافته في الباك في `CORS_ORIGINS`.

> للعملاء غير المتصفح (Postman مثلًا) ما زال `Authorization: Bearer <token>` مقبولًا كبديل، لكن التوكن لم يعد يرجع في الـ body؛ يؤخذ من الـ `Set-Cookie` header.

### شكل الأخطاء

```json
{
  "statusCode": 400,
  "message": "Invalid OTP",
  "error": "Bad Request"
}
```

في أخطاء الـ validation (`400`) يكون `message` **مصفوفة** نصوص.

> في `register` و `login`: إرسال أي حقل غير موثّق في الـ body يرجع `400`. أرسل الحقول المذكورة فقط.

### الأدوار (Roles)

| الدور | الوصف | `tenantId` |
|---|---|---|
| `SUPER_ADMIN` | مدير المنصة | `null` |
| `ACADEMY_ADMIN` | مالك الأكاديمية | رقم الـ tenant الخاص بأكاديميته |
| `STUDENT` | طالب | رقم الـ tenant الخاص بالأكاديمية |

---

## 2. تسجيل الدخول

### `POST /auth/login`

مسار واحد لكل الأدوار (`SUPER_ADMIN` / `ACADEMY_ADMIN` / `STUDENT`). وجّه المستخدم بعد الدخول حسب `user.role`.

```json
{ "email": "user@example.com", "password": "secret123" }
```

| الحقل | النوع | ملاحظات |
|---|---|---|
| `email` | إيميل | مطلوب |
| `password` | نص | مطلوب، لا يقل عن 6 أحرف |

**201**

```
Set-Cookie: access_token=<jwt>; Max-Age=3600; Domain=.my-academy.online; Path=/; HttpOnly; Secure; SameSite=Lax
```

```json
{
  "message": "Login successful",
  "user": { "id": 12, "email": "user@example.com", "role": "STUDENT", "tenantId": 1 }
}
```

- التوكن يرجع في الكوكي فقط، ولا يوجد حقل `token` في الـ body.
- مالك الأكاديمية المدعوّ تكون حالته `INACTIVE` حتى أول تسجيل دخول ناجح، ثم تتحول تلقائيًا إلى `ACTIVE`.
- لا يوجد فحص للـ subdomain: أي حساب يستطيع تسجيل الدخول من أي نطاق، فيجب على الفرونت مقارنة `user.tenantId` بالأكاديمية الحالية.

| الكود | الرسالة |
|---|---|
| `400` | خطأ validation (مثل `Password must be at least 6 characters long`) |
| `401` | `Invalid email or password` |
| `403` | `Your account is suspended` |

### `GET /auth/me` — المستخدم الحالي

يحتاج جلسة (الكوكي). يُستخدم عند تحميل التطبيق لمعرفة هل المستخدم مسجّل دخوله.

**200**

```json
{
  "user": {
    "id": 12,
    "name": "محمد علي",
    "email": "user@example.com",
    "role": "STUDENT",
    "status": "ACTIVE",
    "tenantId": 1
  }
}
```

| الكود | الرسالة |
|---|---|
| `401` | لا توجد جلسة، أو انتهت، أو الحساب محذوف |
| `403` | `Your account is suspended` |

### `POST /auth/logout` — تسجيل الخروج

بدون body. يمسح الكوكي. لا يحتاج جلسة (آمن للاستدعاء حتى لو انتهت).

**201**

```json
{ "message": "Logout successful" }
```

---

## 3. تسجيل الطالب (خطوتان)

### 3.1 الخطوة 1 — `POST /auth/register`

```json
{
  "name": "محمد علي",
  "email": "student@example.com",
  "password": "secret123",
  "role": "STUDENT",
  "status": "ACTIVE"
}
```

| الحقل | النوع | ملاحظات |
|---|---|---|
| `name` | نص | مطلوب، غير فارغ |
| `email` | إيميل | مطلوب |
| `password` | نص | مطلوب، لا يقل عن 6 أحرف |
| `role` | `STUDENT` | مطلوب، والقيمة الوحيدة المقبولة `STUDENT` |
| `status` | `ACTIVE` \| `INACTIVE` \| `SUSPENDED` | مطلوب (أرسل `ACTIVE`) |

**201**

```json
{ "message": "Student account created successfully. Please check your email for verification." }
```

الحساب **لا يُنشأ** في هذه الخطوة؛ تُحفظ البيانات مؤقتًا لمدة **ساعة** ويُرسل إيميل تأكيد إلى الطالب. الحساب يُنشأ فعليًا بعد نجاح الخطوة 2.

| الكود | الرسالة |
|---|---|
| `400` | `user with this email already exists` |
| `400` | خطأ validation (حقل ناقص، أو حقل غير معروف) |

### 3.2 الخطوة 2 — `POST /auth/student/verify-otp`

```json
{ "email": "student@example.com", "otp": "123456" }
```

`otp` يُرسل كنص (string).

**201**

```json
{ "message": "Email verified successfully. your account has been activated. You can now log in." }
```

عند النجاح يُنشأ الحساب بدور `STUDENT` وحالة `ACTIVE`، ويمكنه تسجيل الدخول مباشرة من `POST /auth/login`.

| الكود | الرسالة |
|---|---|
| `400` | `OTP has expired` (مرّت ساعة، أو لا يوجد تسجيل معلّق لهذا الإيميل) |
| `400` | `Invalid OTP` |

---

## 4. تأكيد OTP مالك الأكاديمية

### `POST /auth/academy-admin/verify-otp`

هذه هي الخطوة الثانية من إضافة مالك أكاديمية. الخطوة الأولى (`POST /users/add-academy-admin/:tenant_id`) يستدعيها الـ Super Admin وترسل OTP صالحًا لمدة **5 دقائق** إلى إيميل المالك — راجع القسم 5.2 في [super-admin-api.md](./super-admin-api.md).

```json
{ "email": "ahmed@example.com", "otp": "123456" }
```

**201**

```json
{ "message": "email verified successfully, account created. Please check your email for login details." }
```

عند النجاح:

- يُنشأ الحساب بدور `ACADEMY_ADMIN` وحالة `INACTIVE` (بانتظار الدخول) ويُربط بالأكاديمية.
- تُرسل بيانات الدخول (الإيميل وكلمة مرور مولّدة) إلى إيميل المالك.
- الـ OTP يُلغى بعد استخدامه، فلا يمكن استدعاء المسار مرة ثانية بنفس الكود.
- تتحول الحالة إلى `ACTIVE` تلقائيًا عند أول تسجيل دخول.

| الكود | الرسالة |
|---|---|
| `422` | `OTP has expired` |
| `422` | `Invalid OTP` |

> انتبه: أخطاء الـ OTP هنا ترجع `422`، بينما في مسار الطالب (3.2) ترجع `400`.

---

## 5. ملخص المسارات

| # | Method | المسار | الوظيفة | جلسة |
|---|---|---|---|---|
| 1 | `POST` | `/auth/login` | تسجيل الدخول (كل الأدوار) — يضبط الكوكي | لا |
| 2 | `GET` | `/auth/me` | المستخدم الحالي | نعم |
| 3 | `POST` | `/auth/logout` | تسجيل الخروج — يمسح الكوكي | لا |
| 4 | `POST` | `/auth/register` | تسجيل طالب (إرسال إيميل التأكيد) | لا |
| 5 | `POST` | `/auth/student/verify-otp` | تأكيد OTP الطالب وإنشاء الحساب | لا |
| 6 | `POST` | `/auth/academy-admin/verify-otp` | تأكيد OTP المالك وإنشاء الحساب | لا |

---

## 6. مشاكل معروفة حاليًا (تسجيل الطالب)

مسار تسجيل الطالب **لا يعمل من أوله لآخره** في الكود الحالي. المسارات موثّقة أعلاه كما هي مصمّمة، لكن يجب إصلاح التالي في الباك قبل الربط:

- **الـ OTP لا يُحفظ:** `register` يولّد OTP لكنه لا يخزّنه مع بيانات التسجيل، لذلك `POST /auth/student/verify-otp` يرجع دائمًا `Invalid OTP`.
- **الـ OTP غير ظاهر في الإيميل:** نسخة الـ HTML من الإيميل فيها زر "Verify Your Email" فقط بدون الكود (الكود موجود في النسخة النصية فقط).
- **رابط التأكيد خاطئ:** الـ slug لا يُقرأ بشكل صحيح، فالرابط يخرج بهذا الشكل `https://[object Promise].my-academy.online/verify-otp?email=...`.
- **الأكاديمية غير محدّدة:** `register` لا يستقبل `tenantId` من أي مكان (لا من الـ body ولا من المسار ولا من الـ subdomain)، فالطالب يُنشأ بدون ربط بأكاديمية (`tenantId: null`).
- **`role` و `status` مطلوبان في الـ body** مع أن قيمتهما لا تُستخدم (الحساب يُنشأ دائمًا `STUDENT` / `ACTIVE`).
- **بيانات التسجيل المعلّقة لا تُحذف بعد التأكيد:** استدعاء `verify-otp` مرة ثانية خلال الساعة يرجع `500` بدل رسالة واضحة.
- **لا يوجد إعادة إرسال OTP** للطالب، ولا "نسيت كلمة المرور" لأي دور.
