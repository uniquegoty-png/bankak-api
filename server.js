const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// قاعدة بيانات محلية مؤقتة تحتوي على حساب افتراضي للمعاينة
let users = {
    "123456": { name: "علي يعقوب", password: "123", balance: 5000, device_id: "" }
};

// 1. واجهة التحكم (لوحة المدير) - تظهر عند فتح الرابط في المتصفح
app.get('/', (req, res) => {
    let rows = '';
    for (let acc in users) {
        rows += `
        <tr>
            <td>${users[acc].name}</td>
            <td><b>${acc}</b></td>
            <td>${users[acc].password}</td>
            <td><b style="color: green;">${users[acc].balance} SDG</b></td>
            <td>
                <form action="/admin/add-balance" method="POST" style="display:inline;">
                    <input type="hidden" name="account_number" value="${acc}">
                    <input type="number" name="amount" placeholder="المبلغ" required style="width:70px;">
                    <button type="submit" style="background:#28a745; color:white; border:none; padding:3px 7px; cursor:pointer;">إضافة</button>
                </form>
                <form action="/admin/delete" method="POST" style="display:inline; margin-left:5px;">
                    <input type="hidden" name="account_number" value="${acc}">
                    <button type="submit" style="background:#dc3545; color:white; border:none; padding:3px 7px; cursor:pointer;">حذف</button>
                </form>
            </td>
        </tr>`;
    }

    res.send(`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
        <meta charset="UTF-8">
        <title>لوحة تحكم السيرفر</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 20px; background: #f4f6f9; text-align: center; }
            .container { max-width: 800px; margin: auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0px 0px 10px rgba(0,0,0,0.1); }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: right; }
            th { background-color: #007bff; color: white; }
            input, button { padding: 8px; margin: 5px; border-radius: 4px; border: 1px solid #ccc; }
            button { background: #007bff; color: white; border: none; cursor: pointer; }
            .form-box { background: #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>لوحة تحكم إدارة الحسابات 📱</h2>
            
            <div class="form-box">
                <h3>إنشاء حساب مخصص جديد</h3>
                <form action="/admin/create-user" method="POST">
                    <input type="text" name="name" placeholder="اسم الشخص" required>
                    <input type="text" name="account_number" placeholder="رقم الحساب" required>
                    <input type="text" name="password" placeholder="كلمة السر" required>
                    <input type="number" name="balance" placeholder="الرصيد الافتتاحي" value="0">
                    <button type="submit">صناعة الحساب وحفظه</button>
                </form>
            </div>

            <h3>الحسابات الحالية المسجلة بالسيرفر</h3>
            <table>
                <thead>
                    <tr>
                        <th>الاسم</th>
                        <th>رقم الحساب</th>
                        <th>كلمة السر</th>
                        <th>الرصيد</th>
                        <th>التحكم</th>
                    </tr>
                </thead>
                <tbody>
                    ${rows || '<tr><td colspan="5" style="text-align:center;">لا توجد حسابات مسجلة بعد</td></tr>'}
                </tbody>
            </table>
        </div>
    </body>
    </html>
    `);
});

// 2. كود لوحة التحكم لإضافة حساب جديد
app.post('/admin/create-user', (req, res) => {
    const { name, account_number, password, balance } = req.body;
    if (account_number) {
        users[account_number] = {
            name: name || "مستخدم غير معروف",
            password: password || "1234",
            balance: parseFloat(balance) || 0,
            device_id: ""
        };
    }
    res.redirect('/');
});

// 3. كود لوحة التحكم لزيادة رصيد حساب
app.post('/admin/add-balance', (req, res) => {
    const { account_number, amount } = req.body;
    if (account_number && users[account_number]) {
        users[account_number].balance += parseFloat(amount) || 0;
    }
    res.redirect('/');
});

// 4. كود لوحة التحكم لحذف حساب
app.post('/admin/delete', (req, res) => {
    const { account_number } = req.body;
    if (account_number && users[account_number]) {
        delete users[account_number];
    }
    res.redirect('/');
});

// 5. ربط التطبيق (API) للسماح بتسجيل الدخول من الهاتف
app.post('/api/login.php', (req, res) => {
    const account_number = req.body.account_number;
    const password = req.body.password;

    // التحقق من وجود الحساب ومطابقة كلمة السر المدخلة مع ما حددته أنت في لوحة التحكم
    if (account_number && users[account_number] && users[account_number].password === password) {
        return res.status(200).json({
            status: "success",
            message: "Logged in successfully",
            balance: users[account_number].balance,
            account_number: account_number
        });
    }

    return res.status(200).json({ status: "error", message: "رقم الحساب أو كلمة السر خاطئة" });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
