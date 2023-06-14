const amqp = require('amqplib');

// Connect to RabbitMQ server
const connectionPromise = amqp.connect('amqp://ctech:ctech@amq.copperbet.com:5672/ctech-vhost');

// Function to handle received results
function handleResults(results) {
  console.log('Received results:', results);
}

// Function to start a subscriber
async function startSubscriber() {
  try {
    // Create a channel
    const connection = await connectionPromise;
    const channel = await connection.createChannel();

    const exchange = 'sports_results';

    // Assert the exchange
    await channel.assertExchange(exchange, 'fanout', { durable: false });

    // Create a temporary queue and bind it to the exchange
    const { queue } = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(queue, exchange, '');

    // Consume messages from the queue
    channel.consume(queue, (message) => {
      handleResults(message.content.toString());
    }, { noAck: true });

    console.log('Subscriber started. Waiting for results...');
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage: Start the subscriber
startSubscriber();
