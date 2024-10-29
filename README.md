# PT Serasi Autoraya Coding Test
This project is a coding test for PT Serasi Autoraya, implemented with Node.js and ExpressJS.

## Project Setup
Follow these steps to set up the project on your local machine: 
1. cd to 'service_consumer' and install all dependencies: ```bash npm install ``` 
2. Copy the example environment file and adjust the contents: ```bash cp .env.example .env ``` 
3. Run the service with ```bash npx ts-node emailConsumer.ts``` 
4. cd to service_producer.
5. Copy the example environment file and adjust the contents: ```bash cp .env.example .env ``` 
6. install all dependencies: ```bash npm install ```
7. Start the application: ```bash npm run dev ```
8. Send request to endpoint ```localhost:{port}/send-email```
9. Make sure to include body properties: 'to' (email reciever), 'subject' (email subject), 'text' (email body)

## Dependencies
This project uses the following dependencies: - Express.js - dotenv - Amqplib  - Nodemailer - Typescript