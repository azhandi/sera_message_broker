import 'dotenv/config'; // Change require to import
import amqp, { Connection, Channel } from 'amqplib'; // Import types
import nodemailer, { Transporter } from 'nodemailer'; // Import types

const ENV = process.env;
const rabbitmq_url: string = ENV.RABBITMQ_URL || '';

async function consumeEmailQueue() {
  const queue: string = ENV.QUEUE || 'queue_email';
  
  // Type definitions for connection and channel
  let connection: Connection;
  let channel: Channel;

  try {
    connection = await amqp.connect(rabbitmq_url);
    channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });
    console.log('Waiting for messages in queue:', queue);

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const emailData: { to: string; subject: string; text: string } = JSON.parse(msg.content.toString());

        try {
          const transporter: Transporter = nodemailer.createTransport({
            service: ENV.MAIL_SERVICE || 'gmail',
            auth: {
              user: ENV.AUTH_MAIL || '',
              pass: ENV.AUTH_PASS || '',
            },
          });

          const info = await transporter.sendMail({
            from: ENV.FROM_MAIL || 'someOne@gmail.com',
            to: emailData.to,
            subject: emailData.subject,
            text: emailData.text,
          });

          console.log("\x1b[42m\x1b[37mEmail sent: " + info.messageId + "\x1b[0m");

          channel.ack(msg);
        } catch (error) {
          console.error("\x1b[41m\x1b[37mError sending email: " + error + "\x1b[0m");
        }
      }
    });
  } catch (error) {
    console.error("Error connecting to RabbitMQ:", error);
  }
}

// start
consumeEmailQueue().catch(console.error);
