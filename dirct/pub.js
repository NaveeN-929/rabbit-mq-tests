const amqp = require('amqplib');

// Connect to RabbitMQ server
const connectionPromise = amqp.connect('amqp://ctech:ctech@amq.copperbet.com:5672/test-vh');

// Create a channel and publish a message
connectionPromise
  .then((connection) => connection.createChannel())
  .then((channel) => {
    const queue = 'test';
    const message = 'Hello, RabbitMQ!';

    // Assert the queue
    // channel.assertQueue(queue);

    // Publish the message to the queue
    channel.sendToQueue(queue, Buffer.from(message));
    console.log('Message sent:', message);
  })
  .catch((error) => {
    console.error('Error:', error);
  });
