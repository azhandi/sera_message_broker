require('dotenv').config();

const amqp = require('amqplib')
const nodemailer = require('nodemailer')

const ENV = process.env
const rabbitmq_url = ENV.RABBITMQ_URL || ''

async function consumeEmailQueue() {
  const queue = ENV.QUEUE || 'queue_email'
  const connection = await amqp.connect(rabbitmq_url)
  const channel = await connection.createChannel()

  await channel.assertQueue(queue, { durable: true })
  console.log('Waiting for messages in queue:', queue)

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const emailData = JSON.parse(msg.content.toString())

      try {
        const transporter = nodemailer.createTransport({
          service: ENV.MAIL_SERVICE || 'gmail',
          auth: {
            user: ENV.AUTH_MAIL || '',
            pass: ENV.AUTH_PASS || '',
          },
        })

        const info = await transporter.sendMail({
          from: ENV.FROM_MAIL || 'someOne@gmail.com',
          to: emailData.to,
          subject: emailData.subject,
          text: emailData.text,
        })

        console.log("\x1b[42m\x1b[37mEmail sent: " + info.messageId + "\x1b[0m");

        channel.ack(msg)
      } catch (error) {
        console.error("\x1b[41m\x1b[37mError sending email: " + error + "\x1b[0m");
      }
    }
  })
}

// start
consumeEmailQueue().catch(console.error)
