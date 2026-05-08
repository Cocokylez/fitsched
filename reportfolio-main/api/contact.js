import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { name, email, message } = req.body

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required.' })
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to:   ['kuyag100621@gmail.com'],
      replyTo: email,
      subject: `Portfolio Message from ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:500px;margin:auto;padding:24px;background:#111;color:#e0e0e0;border-radius:12px;">
          <h2 style="color:#3b9eff;">New Portfolio Message</h2>
          <hr style="border-color:#333;margin-bottom:20px"/>
          <p><strong style="color:#888">Name:</strong><br/>${name}</p>
          <p><strong style="color:#888">Email:</strong><br/>
            <a href="mailto:${email}" style="color:#3b9eff">${email}</a>
          </p>
          <p><strong style="color:#888">Message:</strong><br/>
            ${message.replace(/\n/g, '<br/>')}
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', JSON.stringify(error))
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true, id: data?.id })
  } catch (err) {
    console.error('Caught error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
