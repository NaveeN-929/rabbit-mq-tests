const amqp = require('amqplib');

// Connect to RabbitMQ server
const connectionPromise = amqp.connect('amqp://ctech:ctech@amq.copperbet.com:5672/test-vh');

// Function to publish a message
async function publishMessage(message) {
  try {
    // Create a channel
    const connection = await connectionPromise;
    const channel = await connection.createChannel();

    const exchange = 'message_exchange';

    // Assert the exchange
    await channel.assertExchange(exchange, 'fanout', { durable: false });

    // Publish the message to the exchange
    channel.publish(exchange, '', Buffer.from(message));
    console.log('Message published:', message);

    // Close the connection
    // await channel.close();
    // await connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage: Call the publishMessage function with the message to be published
const message = 'Hello, subscribers!';
publishMessage(message);
