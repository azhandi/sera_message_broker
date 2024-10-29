require('dotenv').config();

const express = require('express')
const amqp = require('amqplib')
const bodyParser = require('body-parser')
const { validateEmail } = require('./helper/validation')

const app = express()
const ENV = process.env
const port = ENV.PORT || 5000
const rabbitmq_url = ENV.RABBITMQ_URL || ''
const connection_close_delay = ENV.CLOSE_DELAY || 500
app.use(bodyParser.json())

async function sendEmailToQueue(emailData) {
    const queue = ENV.QUEUE || 'queue_email'
    const connection = await amqp.connect(rabbitmq_url)
    console.log('connection ', rabbitmq_url)
    const channel = await connection.createChannel()

    await channel.assertQueue(queue, { durable: true })

    const result = channel.sendToQueue(queue, Buffer.from(JSON.stringify(emailData)), { persistent: true })
    console.log(`Email data sent to queue ${queue} with data :`, emailData)
    setTimeout(() => {
        channel.close();
        connection.close();
    }, connection_close_delay);

    return result
}


app.post('/send-email', async (req, res) => {
    try {
        const { to, subject, text } = req.body

        if (!to || !subject || !text) {
            throw { errorCode: '#mail001', errorMessage: 'To, subject, and text are required.' }
        }

        if (!validateEmail(to)) {
            throw { errorCode: '#mail002', errorMessage: 'Reciever mail address is invalid.' }
        }
    
        const emailData = {
            to,
            subject,
            text,
        }
        await sendEmailToQueue(emailData)
        res.status(200).json({ message: 'Email data sent to queue successfully.' })
    } catch (error) {
        console.error('Error sending email to queue:', error)
        res.status(500).json({
            errorCode: error.errorCode || "#999",
            errorMessage: error.errorMessage || "An unexpected error occurred",
          })
    }
})

app.listen(port, () => {
    console.log(`Email producer running at http://localhost:${port}`)
})
