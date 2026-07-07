# دليل ربط Firebase | Firebase Setup Guide

المشروع مربوط مسبقاً بمشروع Firebase: **menutest-78a3e**  
الإعدادات موجودة في `firebase-config.js`.

---

## الخطوة 1: تفعيل الخدمات في Firebase Console

افتح [Firebase Console](https://console.firebase.google.com/) واختر مشروعك:

1. **Authentication** → Sign-in method → فعّل **Email/Password**
2. **Firestore Database** → أنشئ قاعدة بيانات (Production mode)
3. **Storage** → أنشئ bucket للصور

---

## الخطوة 2: إنشاء حساب الأدمن (مطلوب — لا يوجد وضع تجريبي)

1. من Authentication → Users → **Add user**
2. أدخل البريد وكلمة المرور (مثال: `admin@restaurant.com`)
3. **يجب** تسجيل الدخول بهذا الحساب — لا يمكن الدخول للوحة التحكم بدون Firebase Auth

---

## الخطوة 3: إضافة صلاحيات المستخدم في Firestore (مهم جداً)

> إذا ظهر خطأ **Missing or insufficient permissions** بعد تسجيل الدخول، السبب غالباً أحد اثنين:
> - قواعد Firestore غير منشورة
> - مستند `users/{uid}` غير موجود

### أ) انسخ قواعد الأمان

1. افتح Firebase Console → **Firestore Database** → **Rules**
2. انسخ محتوى ملف `firestore.rules` من المشروع والصقه
3. اضغط **Publish**

### ب) أنشئ مستند الأدمن

1. من **Authentication** → **Users** انسخ **User UID** للمستخدم `admin@menutest.com`
2. من **Firestore** → **Start collection** → Collection ID: `users`
3. Document ID = **UID** الذي نسخته (مثال: `kR3xYz9Abc...`)
4. أضف الحقول:

```json
{
  "email": "admin@menutest.com",
  "role": "restaurant_admin",
  "restaurantId": "taste"
}
```

| role | الصلاحيات |
|------|-----------|
| `super_admin` | كل المطاعم |
| `restaurant_admin` | إدارة كاملة لمطعم واحد |
| `staff_editor` | تعديل القائمة فقط (بدون الإعدادات) |

---

## الخطوة 4: نشر قواعد الأمان

ثبّت Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
firebase use menutest-78a3e
firebase deploy --only firestore:rules
```

---

## الخطوة 5: تشغيل المشروع محلياً

```bash
python -m http.server 8000
```

| الصفحة | الرابط |
|--------|--------|
| القائمة العامة | http://127.0.0.1:8000/ |
| لوحة التحكم | http://127.0.0.1:8000/admin.html |

عند أول تسجيل دخول للأدمن، يتم **رفع البيانات الافتراضية تلقائياً** إلى Firestore إذا كانت فارغة.

---

## الخطوة 6: ربط مطعم آخر

استخدم معامل URL:

```
https://your-site.com/?r=coffee-shop-name
```

وفي Firestore أنشئ مستند `restaurants/coffee-shop-name` مع نفس هيكل البيانات.

---

## هيكل قاعدة البيانات

```
restaurants/{restaurantId}
├── name: { en, ar }
├── slogan: { en, ar }
├── whatsappNumber
├── logoUrl
├── colors: { bg, surface, gold }
├── subscription: { status: "active" | "trial" | "expired" }
├── analytics: { views, whatsappOrders }
│
├── categories/{categoryId}
│   ├── name: { en, ar }
│   └── orderIndex
│
└── menu_items/{itemId}
    ├── name, description, tags (en/ar)
    ├── price, categoryId, imageUrl
    ├── isAvailable, orderIndex
    └── views, orderClicks
```

---

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| لا يمكن تسجيل الدخول | تأكد من تفعيل Email/Password في Authentication |
| Permission denied عند الحفظ | أضف مستند `users/{uid}` مع `restaurantId` و `role` |
| القائمة لا تتحدث | تحقق من `firebase-config.js` وافتح Console للأخطاء |
| الإحصائيات لا تُحسب | انشر `firestore.rules` المحدّثة (تسمح بزيادة العدادات من القائمة العامة) |

---

## تغيير إعدادات Firebase

عدّل `firebase-config.js` بقيم مشروعك من:  
**Project Settings → Your apps → SDK setup and configuration**

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```
