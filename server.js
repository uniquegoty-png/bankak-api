const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// تفعيل قراءة البيانات القادمة من الواجهات والنماذج (Forms)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// قاعدة بيانات مؤقتة داخل ذاكرة السيرفر (تتغير ديناميكياً من لوحة التحكم)
let users = {
    "123456": { name: "مستخدم افتراضي", password: "123", balance: 5000 }
};

// 1. لوحة التحكم (عرض الحسابات وإضافة/تعديل البيانات ومبلغ الرصيد)
app.get('/', (req, res) => {
    let rows = '';
    for (let acc in users) {
        rows += `
        <tr>
            <td style="padding: 10px; border: 1px solid #ddd;">${users[acc].name}</td>
            <td style="padding: 10px; border: 1px solid #ddd;"><b>${acc}</b></td>
            <td style="padding: 10px; border: 1px solid #ddd;"><code>${users[acc].password}</code></td>
            <td style="padding: 10px; border: 1px solid #ddd;"><b style="color: #2ecc71;">${users[acc].balance} SDG</b></td>
        </tr>`;
    }

    res.send(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>لوحة تحكم السيرفر 📱</title>
        <style>
            body { font-family: Tahoma, sans-serif; background-color: #f4f6f9; margin: 20px; color: #333; }
            .container { max-width: 800px; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); margin: 0 auto; }
            h2, h3 { color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; background: #fff; }
            th { background-color: #3498db; color: white; padding: 10px; text-align: right; }
            .form-group { margin-bottom: 15px; }
            label { display: block; margin-bottom: 5px; font-weight: bold; }
            input[type="text"], input[type="number"] { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
            button { background-color: #2ecc71; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; font-size: 16px; width: 100%; }
            button:hover { background-color: #27ae60; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>لوحة التحكم السريعة لإدارة الحسابات 📱</h2>
            
            <!-- نموذج إضافة أو تعديل رصيد حساب -->
            <h3>إضافة حساب جديد أو تعديل الرصيد والمبلغ</h3>
            <form action="/add-user" method="POST">
                <div class="form-group">
                    <label>الاسم الكامل:</label>
                    <input type="text" name="name" placeholder="مثال: علي حامد" required>
                </div>
                <div class="form-group">
                    <label>رقم الحساب:</label>
                    <input type="text" name="account" placeholder="مثال: 123456" required>
                </div>
                <div class="form-group">
                    <label>كلمة المرور:</label>
                    <input type="text" name="password" placeholder="مثال: 123" required>
                </div>
                <div class="form-group">
                    <label>إضافة مبلغ الرصيد (SDG):</label>
                    <input type="number" name="balance" placeholder="مثال: 5000" required>
                </div>
                <button type="submit">حفظ البيانات وتحديث السيرفر</button>
            </form>

            <br>
            <h3>الحسابات المسجلة حالياً</h3>
            <table>
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>رقم الحساب</th>
                        <th>كلمة السر</th>
                        <th>الرصيد الحالي</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows || '<tr><td colspan="4" style="text-align:center; padding:10px;">لا توجد حسابات مسجلة</td></tr>'}
                </tbody>
            </table>
        </div>
    </body>
    </html>
    `);
});

// 2. استقبال البيانات من لوحة التحكم وتخزينها ديناميكياً
app.post('/add-user', (req, res) => {
    const { name, account, password, balance } = req.body;
    
    if (account) {
        // إضافة الحساب أو تحديثه في الذاكرة مباشرة
        users[account] = {
            name: name || "مستخدم غير مسمى",
            password: password || "123",
            balance: parseFloat(balance) || 0
        };
    }
    // إعادة توجيه المستخدم للوحة التحكم بعد الحفظ لمشاهدة التحديث فوراً
    res.redirect('/');
});

// 3. مسار تسجيل الدخول وإضافة الحساب المحدث للتطبيق
app.post('/api/login.php', (req, res) => {
    try {
        const shortAccount = req.body.short_account_number || req.query.short_account_number || "123456";
        
        // التحقق من وجود الحساب في لوحة التحكم، وإذا لم يوجد نأخذ القيم الافتراضية
        const user = users[shortAccount] || { name: "علي حامد", balance: 5000 };

        const responseData = {
            "status": "success",
            "message": "Success",
            "full_account_number": shortAccount,
            "account_owner": user.name,
            "nickname": "المستفيد الافتراضي",
            "account_branch": "الفرع الرئيسي",
            "balance": user.balance,
            "success": true
        };
        return res.status(200).json(responseData);
    } catch (err) {
        return res.status(200).json({ status: "success", success: true });
    }
});

// 4. مسار الواجهة الداخلية المكتشف (account_number.php)
app.post('/api/account_number.php', (req, res) => {
    try {
        const responseData = {
            "success": true, 
            "status": "success",
            "message": "بنجاح العملية تمت"
        };
        return res.status(200).json(responseData);
    } catch (err) {
        return res.status(200).json({ success: false, message: "حدث خطأ" });
    }
});

// المسارات الاحتياطية
app.post('/api/check_internal_account.php', (req, res) => res.status(200).json({ status: "success", success: true }));
app.post('/api/fetch_balance.php', (req, res) => res.status(200).json({ status: "success", success: true, balance: 5000 }));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
