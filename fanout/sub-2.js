const amqp = require('amqplib');

// Connect to RabbitMQ server
const connectionPromise = amqp.connect('amqp://ctech:ctech@amq.copperbet.com:5672/test-vh');

// Function to handle received messages
function handleMessage(message) {
  console.log('Subscriber 2 received:', message.content.toString());
}

// Function to start a subscriber
async function startSubscriber() {
  try {
    // Create a channel
    const connection = await connectionPromise;
    const channel = await connection.createChannel();

    const exchange = 'message_exchange';

    // Assert the exchange
    await channel.assertExchange(exchange, 'fanout', { durable: false });

    // Create a temporary queue and bind it to the exchange
    const { queue } = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(queue, exchange, '');

    // Consume messages from the queue
    channel.consume(queue, (message) => {
      handleMessage(message);
    }, { noAck: true });

    console.log('Subscriber 2 started. Waiting for messages...');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage: Start the subscriber
startSubscriber();
