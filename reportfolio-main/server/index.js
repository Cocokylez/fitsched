import express from 'express'
import nodemailer from 'nodemailer'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = 3001

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())

/* ── Email transporter using Gmail ── */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

/* ── Contact form route ── */
app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' })
  }

  try {
    await transporter.sendMail({
      from: `"${name}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,          // sends to your own inbox
      replyTo: email,                       // reply goes back to the sender
      subject: `Portfolio Message from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;background:#0a0a0a;color:#e0e0e0;border-radius:12px;">
          <h2 style="color:#3b9eff;margin-bottom:4px;">New Portfolio Message</h2>
          <hr style="border-color:#222;margin-bottom:20px"/>
          <p><strong style="color:#888">Name:</strong><br/>${name}</p>
          <p><strong style="color:#888">Email:</strong><br/><a href="mailto:${email}" style="color:#3b9eff">${email}</a></p>
          <p><strong style="color:#888">Message:</strong><br/>${message.replace(/\n/g, '<br/>')}</p>
        </div>
      `,
    })

    res.status(200).json({ success: true, message: 'Email sent successfully!' })
  } catch (err) {
    console.error('Mail error:', err)
    res.status(500).json({ error: 'Failed to send email. Check your .env credentials.' })
  }
})

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`)
})
