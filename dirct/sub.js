const amqp = require('amqplib');

// Define a callback function for received messages
function consumeMessage(message) {
  console.log('Received message:', message.content.toString());
}

// Connect to RabbitMQ server
const connectionPromise = amqp.connect('amqp://ctech:ctech@amq.copperbet.com:5672/test-vh');

// Create a channel and consume messages
connectionPromise
  .then((connection) => connection.createChannel())
  .then((channel) => {
    const queue = 'hello';

    // Assert the queue
    channel.assertQueue(queue);

    // Set up a consumer and provide the callback function
    channel.consume(queue, consumeMessage, { noAck: true });
    console.log('Consumer started. Waiting for messages...');
  })
  .catch((error) => {
    console.error('Error:', error);
  });
