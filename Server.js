require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.static(__dirname));
app.use(express.json());

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
Eres Boosting AI, asistente oficial de Boosting.

IMPORTANTE:
- Responde corto, moderno y directo.
- No mandes textos largos.
- Habla como una agencia moderna.

Tu trabajo:
1. Ayudar clientes interesados en páginas web.
2. Hacer preguntas para conocer el proyecto.
3. Pedir:
- Nombre
- Correo
- Número
- Nombre de la marca o página
- Tipo de página
- Colores
- Estilo deseado
- Si tienen logo o imágenes

4. Recomendar:
- Hostinger para páginas normales
- Shopify solo para ecommerce

5. Precios:
- Desde $150-$200+
- Depende del proyecto

6. Ofrecer mantenimiento SOLO al final o si preguntan.

7. Solo dar estos números si el cliente lo necesita:
- +506 89678064
- +506 6099 2165

8. Cuando tengas TODOS los datos responde EXACTAMENTE así:

CLIENTE:{"nombre":"...","correo":"...","telefono":"...","marca":"...","tipo":"...","colores":"...","estilo":"...","detalles":"..."}

9. Siempre responde en español.
`
            },
            ...req.body.messages
          ],
          max_tokens: 300
        })
      }
    );

    const data = await response.json();

    if (!data.choices) {
      return res.json({
        reply: "Ocurrió un error."
      });
    }

    const reply = data.choices[0].message.content;

    if (reply.includes("CLIENTE:")) {
  return res.json({
    reply:
      "✅ Perfecto. Ya tenemos la información de tu proyecto. Te contactaremos pronto 🚀"
  });
}

    res.json({ reply });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🚀 Boosting AI funcionando");
});