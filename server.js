app.post('/api/login.php', (req, res) => {
    // قراءة البيانات المرسلة لتجنب الأخطاء
    const shortAccount = req.body.short_account_number || "123456";

    // بناء الاستجابة الشاملة التي تحتوي على المفاتيح التي تبحث عنها واجهة النجاح
    const responseData = {
        "status": "success",
        "message": "Success",
        "full_account_number": shortAccount,       // مطلوب في السطر 194
        "account_owner": "علي حامد",              // مطلوب في السطر 208
        "nickname": "المستفيد الافتراضي",          // مطلوب في السطر 222
        "account_branch": "الفرع الرئيسي",         // مطلوب في السطر 235
        "balance": 5000
    };

    // إرسال الرد المكتمل بصيغة JSON
    return res.status(200).json(responseData);
});
