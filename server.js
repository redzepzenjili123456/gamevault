const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const codes = {};

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "gamingskud01@gmail.com",
        pass: "kcnczcnrlskjfbwl"
    }
});

function createBeautifulEmail(username, code) {
    const formattedCode = code.toString().split('').join(' ');
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background: #0a0a2e; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="500" cellpadding="0" cellspacing="0" style="background: #1a1a3e; border-radius: 15px; border: 1px solid #333;">
                    <tr>
                        <td style="padding: 40px 35px;">
                            <div style="text-align: center;">
                                <div style="font-size: 48px;">🎮</div>
                                <h1 style="color: #667eea; font-size: 28px; margin: 10px 0 5px;">GAMEVAULT</h1>
                                <p style="color: #888; font-size: 11px;">GAMES PORTAL</p>
                            </div>
                            <hr style="border-color: #333; margin: 20px 0;">
                            <p style="color: #fff; font-size: 16px;">Здраво, <strong style="color: #ffd89b;">${username}</strong>!</p>
                            <p style="color: #aaa; font-size: 13px;">Еве го вашиот еднократен код за најава:</p>
                            <div style="background: #0a0a1a; padding: 30px; text-align: center; border-radius: 10px; margin: 20px 0; border: 1px solid #667eea;">
                                <h1 style="color: #ffd89b; font-size: 46px; letter-spacing: 8px; margin: 0;">${formattedCode}</h1>
                            </div>
                            <div style="background: #441111; padding: 12px; border-left: 4px solid #ff4444; margin: 20px 0;">
                                <p style="color: #ff8888; margin: 0; font-size: 13px;">⚠️ Овој код истекува за <strong>2 минути</strong>!</p>
                            </div>
                            <p style="color: #888; text-align: center; font-size: 12px;">🔒 <strong>Не го споделувајте овој код со никого</strong></p>
                            <p style="color: #666; text-align: center; font-size: 10px;">Доколку не сте го побарале, игнорирајте</p>
                            <hr style="border-color: #333; margin: 25px 0 20px;">
                            <div style="text-align: center;">
                                <a href="#" style="color: #667eea; text-decoration: none; font-size: 11px;">Заборавивте лозинка?</a>
                                <span style="color: #555;"> | </span>
                                <a href="#" style="color: #667eea; text-decoration: none; font-size: 11px;">Регистрирај се</a>
                            </div>
                            <p style="color: #555; text-align: center; font-size: 10px; margin-top: 30px;">© 2024 GameVault. Сите права се задржани.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;
}

app.get("/test", (req, res) => {
    res.json({ success: true, message: "Серверот работи!" });
});

app.post("/send-code", async (req, res) => {
    const { email, username } = req.body;
    
    if (!email || !username) {
        return res.json({ success: false, message: "Е-пошта и име се потребни" });
    }
    
    const code = Math.floor(1000 + Math.random() * 9000);
    
    codes[email] = {
        code: code,
        username: username,
        expires: Date.now() + 2 * 60 * 1000
    };
    
    try {
        await transporter.sendMail({
            from: '"GameVault" <gamingskud01@gmail.com>',
            to: email,
            subject: "🎮 GameVault - Вашиот код за најава",
            html: createBeautifulEmail(username, code)
        });
        
        res.json({ success: true, message: "Кодот е испратен!" });
    } catch (error) {
        res.json({ success: false, message: "Грешка при испраќање" });
    }
});

app.post("/verify-code", (req, res) => {
    const { email, code } = req.body;
    
    if (!codes[email]) {
        return res.json({ success: false, message: "Нема активен код. Испратете нов." });
    }
    
    const data = codes[email];
    
    if (Date.now() > data.expires) {
        delete codes[email];
        return res.json({ success: false, message: "Кодот е истечен (2 минути)." });
    }
    
    if (parseInt(code) === data.code) {
        const username = data.username;
        delete codes[email];
        res.json({ success: true, username: username });
    } else {
        res.json({ success: false, message: "Погрешен код. Обидете се повторно." });
    }
});

app.listen(3000, () => {
    console.log("========================================");
    console.log("🚀 СЕРВЕРОТ РАБОТИ!");
    console.log("📡 http://localhost:3000");
    console.log("========================================");
});