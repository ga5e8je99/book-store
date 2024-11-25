const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

// إعداد الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/paymentsDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});

// تعريف مخطط البيانات
const paymentSchema = new mongoose.Schema({
    cardNumber: { type: String, required: true },
    expiryDate: { type: String, required: true },
    cvv: { type: String, required: true },
    cardName: { type: String, required: true },
    price: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

// إنشاء نموذج
const Payment = mongoose.model('Payment', paymentSchema);

// إعداد الميدل وير
app.use(cors());
app.use(bodyParser.json());

// نقطة النهاية لمعالجة الدفع
app.post('/api/payments', async (req, res) => {
    const { cardNumber, expiryDate, cvv, cardName, price } = req.body;

    // التحقق من صحة البيانات
    if (!cardNumber || !expiryDate || !cvv || !price) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // حفظ البيانات في MongoDB
        const newPayment = new Payment({
            cardNumber,
            expiryDate,
            cvv,
            cardName,
            price
        });
        await newPayment.save();
        res.status(200).json({ message: 'Payment processed successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to process payment.' });
    }
});

// تشغيل الخادم
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
