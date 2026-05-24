require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();

app.use(cors());
app.use(express.static(__dirname));
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

async function enviarEmail(cita) {
  const mensaje = `
Nueva cita agendada en Boosting 🚀

Cliente: ${cita.nombre}
Email: ${cita.email}
Teléfono: ${cita.telefono}
Fecha y hora: ${cita.fecha}
Mensaje: ${cita.mensaje}
`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: "arigazofeifa@gmail.com, diegoandresardiles@gmail.com",
    subject: `Nueva cita - ${cita.nombre}`,
    text: mensaje
  });
}

app.post("/agendar", async (req, res) => {
  try {
    const cita = req.body;

    await enviarEmail(cita);

    res.json({ ok: true });
  } catch (error) {
    console.log("Error enviando email:", error);
    res.status(500).json({ ok: false });
  }
});

app.post("/chat", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: `
Eres Boosting AI, el asistente virtual oficial de Boosting, una agencia moderna de diseño y desarrollo de páginas web profesionales.

Tu trabajo es:

1. Dar la bienvenida al cliente de manera profesional y amigable
2. Explicar los servicios de Boosting:
   - Diseño de páginas web
   - Desarrollo web profesional
   - Tiendas online
   - Landing pages
   - Branding digital
   - Optimización y automatización

3. Responder preguntas sobre páginas web y servicios digitales

4. Cuando el cliente quiera agendar una llamada o reunión, pedir:
   - Nombre completo
   - Email
   - Teléfono
   - Fecha y hora preferida
   - Breve descripción del proyecto

5. Los horarios disponibles son:
   - Lunes a Viernes: 4pm a 10pm
   - Sábados y Domingos: 12pm a 10pm

6. Cuando tengas TODOS los datos del cliente, responde EXACTAMENTE en este formato JSON y nada más:

CITA:{"nombre":"...","email":"...","telefono":"...","fecha":"...","mensaje":"..."}

7. Siempre responde en español.
8. Sé elegante, moderna, profesional y cercana.
9. Cuando pregunten por precios, explica que depende del proyecto y recomienda agendar una llamada con Boosting.
`
            },
            ...req.body.messages
          ],
          max_tokens: 500
        })
      }
    );

    const data = await response.json();

    if (!data.choices) {
      return res.json({
        reply: "Error: " + (data.error?.message || "Sin respuesta")
      });
    }

    const reply = data.choices[0].message.content;

    if (reply.includes("CITA:")) {
      const jsonStr = reply.split("CITA:")[1].trim();

      const cita = JSON.parse(jsonStr);

      await enviarEmail(cita);

      return res.json({
        reply: `✅ ¡Perfecto ${cita.nombre}! Tu reunión con Boosting ha sido agendada para el ${cita.fecha}. Te enviaremos una confirmación a ${cita.email}. 🚀`,
        cita
      });
    }

    res.json({ reply });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Servidor Boosting funcionando en puerto 3000");
});