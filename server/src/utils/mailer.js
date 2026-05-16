const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendAnalysisComplete = async ({ to, billTitle, billNumber, stats }) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('Email not configured — skipping notification');
      return;
    }

    await transporter.sendMail({
      from: `"CivicSense" <${process.env.EMAIL_USER}>`,
      to,
      subject: `Analysis Complete — ${billTitle}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
          <div style="background:#1e40af;padding:30px;border-radius:12px 12px 0 0">
            <h1 style="color:white;margin:0;font-size:22px">CivicSense</h1>
            <p style="color:#bfdbfe;margin:8px 0 0">AI Analysis Complete</p>
          </div>
          <div style="background:#f8fafc;padding:30px;border-radius:0 0 12px 12px;border:1px solid #e2e8f0">
            <h2 style="color:#1e293b;font-size:18px">Your analysis is ready!</h2>
            <p style="color:#64748b">Bill: <strong>${billTitle}</strong> (${billNumber})</p>
            <div style="display:flex;gap:16px;margin:20px 0">
              <div style="background:#d1fae5;padding:16px;border-radius:8px;text-align:center;flex:1">
                <div style="font-size:24px;font-weight:bold;color:#065f46">${stats.positive}</div>
                <div style="font-size:12px;color:#064e3b">Positive</div>
              </div>
              <div style="background:#fef3c7;padding:16px;border-radius:8px;text-align:center;flex:1">
                <div style="font-size:24px;font-weight:bold;color:#92400e">${stats.neutral}</div>
                <div style="font-size:12px;color:#78350f">Neutral</div>
              </div>
              <div style="background:#fee2e2;padding:16px;border-radius:8px;text-align:center;flex:1">
                <div style="font-size:24px;font-weight:bold;color:#991b1b">${stats.negative}</div>
                <div style="font-size:12px;color:#7f1d1d">Negative</div>
              </div>
            </div>
            <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/analysis" 
               style="display:inline-block;background:#1e40af;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold">
              View Full Analysis →
            </a>
          </div>
        </div>
      `,
    });
    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

module.exports = { sendAnalysisComplete };