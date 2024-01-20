"use strict";
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.meta.ua",
  port: 465,
  secure: true,
  auth: {
   
    user: "yuriikot@meta.ua",
    pass: "In3063509251",
  },
});


async function sendEmail({userName, userEmail, userMessage}) {
    const output = `<h1 style="color: green">Доброго дня! Ви отримали листа!</h1>
<h2>Вам пише: ${userName}</h2>
<h2>Email для зв'язку ${userEmail}</h2>
<h2 style="color: blue">Текст повідомлення: ${userMessage}</h2>`
    
    const info = await transporter.sendMail({
    from: 'yuriikot@meta.ua', // sender address
    to: "ero1494651@gmail.com", // list of receivers
    subject: "Лист для директора", // Subject line
    text: userMessage, // plain text body
    html: output, // html body
  });

  console.log("Message sent: %s", info.messageId);
  return true
}

module.exports = sendEmail


