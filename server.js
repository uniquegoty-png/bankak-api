const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// قاعدة بيانات مؤقتة
let users = {
    "123456": { name: "مستخدم تجريبي", password: "123", balance: 5000 }
};

// 1. واجهة التحكم للمتصفح
app.get('/', (req, res) => {
    let rows = '';
    for (let acc in users) {
        rows += `
        <tr>
            <td>${users[acc].name}</td>
            <td><b>${acc}</b></td>
            <td>${users[acc].password}</td>
            <td><b style="color: green;">${users[acc].balance} SDG</b></td>
        </tr>`;
    }

    res.send(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <title>لوحة التحكم</title>
    </head>
    <body>
        <h2>لوحة التحكم السريعة 📱</h2>
        <table border="1" style="width:100%; text-align:right;">
            <thead><tr><th>الاسم</th><th>رقم الحساب</th><th>كلمة السر</th><th>الرصيد</th></tr></thead>
            <tbody>${rows || '<tr><td colspan="4">لا توجد حسابات</td></tr>'}</tbody>
        </table>
    </body>
    </html>
    `);
});

// 2. معالجة الطلبات القادمة من التطبيق وتوفير المتغيرات المطلوبة كاملة
app.post('/api/login.php', (req, res) => {
    try {
        const shortAccount = req.body.short_account_number || req.query.short_account_number || "123456";

        // الرد يحتوي على جميع المفاتيح التي تبحث عنها كلاسات النجاح بالتطبيق لمنع Data processing error
        const responseData = {
            "status": "success",
            "message": "Success",
            "full_account_number": shortAccount,
            "account_owner": "علي حامد",
            "nickname": "المستفيد الافتراضي",
            "account_branch": "الفرع الرئيسي",
            "balance": 5000,
            "success": true
        };

        return res.status(200).json(responseData);
    } catch (err) {
        return res.status(200).json({ status: "success", message: "Success" });
    }
});

// المسارات الاحتياطية المتبقية
app.post('/api/check_internal_account.php', (req, res) => res.status(200).json({ status: "success" }));
app.post('/api/fetch_balance.php', (req, res) => res.status(200).json({ status: "success" }));
app.post('/api/account_number.php', (req, res) => res.status(200).json({ status: "success" }));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
