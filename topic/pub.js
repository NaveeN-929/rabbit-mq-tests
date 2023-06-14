const amqp = require('amqplib');

// Connect to RabbitMQ server
const connectionPromise = amqp.connect('amqp://ctech:ctech@amq.copperbet.com:5672/test-vh');

// Function to publish a message
async function publishMessage(message, routingKey) {
  try {
    // Create a channel
    const connection = await connectionPromise;
    const channel = await connection.createChannel();

    const exchange = 'message.exchange';

    // Assert the exchange
    await channel.assertExchange(exchange, 'topic', { durable: false });

    // Publish the message to the exchange with a routing key
    channel.publish(exchange, routingKey, Buffer.from(message));
    console.log('Message published:', message);

    // Close the connection
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage: Call the publishMessage function with the message and routing key
const message = 'Hello, subscribers!';
const routingKey = 'example.key';

// const routingKey = 'example1.key';
// const routingKey = 'example2.key';
// const routingKey = 'example3.key';
publishMessage(message, routingKey);
