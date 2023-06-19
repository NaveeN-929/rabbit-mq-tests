const amqp = require('amqplib');

// Connect to RabbitMQ server
// const connectionPromise = amqp.connect('amqp://navin:navin@amq.copperbet.com:5672/ad-vh');

const connectionPromise = amqp.connect('amqp://guest:guest@amq.copperbet.com:5672/');

// Function to consume messages
async function consumeMessages(queueName) {
  try {
    // Create a channel
    const connection = await connectionPromise;
    const channel = await connection.createChannel();

    // Assert the queue
    await channel.assertQueue(queueName, { durable: false });

    // Consume messages from the queue
    channel.consume(
      queueName,
      (msg) => {
        if (msg.content) {
          const message = msg.content.toString();
          console.log('Received message:', message);
          // Do something with the received message
        }
      },
      { noAck: true } // Auto-acknowledge messages
    );

    console.log(`Listening for messages on queue: ${queueName}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage: Call the consumeMessages function with the queue name
const queueName = 'message.queue';
consumeMessages(queueName);
