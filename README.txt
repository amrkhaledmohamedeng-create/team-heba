النسخة النهائية - Dashboard الإسكندرية

سبب المشكلة السابقة:
كان يوجد خطأ JavaScript في دالة saveEmployee: كان اسم الحدث e يُعاد تعريفه كمتغير e داخل نفس الدالة. هذا الخطأ كان يوقف تحميل ملف JavaScript بالكامل، لذلك كل الأزرار كانت تبدو وكأنها لا تستجيب.

تم إصلاح:
1) خطأ JavaScript الذي كان يوقف الموقع بالكامل.
2) زر إنشاء حساب جديد مربوط مباشرة بالـ DOM.
3) إنشاء حساب موظف.
4) منع تكرار اسم المستخدم.
5) حساب المدير admin / 1234.
6) ربط البيانات بـ Google Apps Script.
7) إضافة Users إلى Code.gs.
8) تثبيت رابط Web App داخل الموقع.
9) اللوجو مدمج داخل index.html.

رفع GitHub:
- ارفع index.html فقط للموقع (وملف اللوجو موجود كنسخة احتياطية).
- اعمل Ctrl+Shift+R بعد الرفع.

Google Apps Script:
- استبدل Code.gs بالكامل بالكود الموجود هنا.
- شغل setupSheets مرة واحدة.
- Deploy > Manage deployments > Edit > New version > Deploy.
- تأكد أن Web app: Execute as Me + Who has access Anyone.

بيانات المدير:
Username: admin
Password: 1234
