const amqp = require('amqplib');

// Connect to RabbitMQ server
// const connectionPromise = amqp.connect('amqp://navin:navin@amq.copperbet.com:5672/ad-vh');

const connectionPromise = amqp.connect('amqp://guest:guest@amq.copperbet.com:5672/');

// Function to publish a message
async function publishMessage(message, routingKey) {
  try {
    // Create a channel
    const connection = await connectionPromise;
    const channel = await connection.createChannel();

    const exchange = 'message.exchange';
    const queue = 'message.queue';

    // Assert the exchange and queue
    await channel.assertExchange(exchange, 'topic', { durable: false });
    await channel.assertQueue(queue, { durable: false });
    await channel.bindQueue(queue, exchange, routingKey);

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

publishMessage(message, routingKey);



// rabbitmqctl set_policy ha-fed \
//     ".*" '{"federation-upstream-set":"all", "ha-mode":"nodes", "ha-params":["rabbit@rmq-1","rabbit@rmq-2","rabbit@rmq-3"]}' \
//     --priority 1 \
//     --apply-to queues

// rabbitmqctl set_policy ha-fed ".*" '{"federation-upstream-set":"all", "ha-mode":"nodes", "ha-params":["rabbit@rmq-1","rabbit@rmq-2","rabbit@rmq-3"]}' --priority 1 --apply-to queues


// rabbitmqctl set_policy ha-fed ".*" '{"federation-upstream-set":"all", "ha-sync-mode":"automatic", "ha-mode":"nodes", "ha-params":["rabbit@rabbit-1","rabbit@rabbit-2","rabbit@rabbit-3"]}' --priority 1 --apply-to queues