const amqp = require('amqplib');

async function consumeMessages() {
  try {
    const connection = await amqp.connect('amqp://guest:guest@rmq.copperbet.com:5672/');
    const channel = await connection.createChannel();
    
    const exchangeName = 'test';
    const queueName = 'test-q';
    
    // Declare the header exchange
    await channel.assertExchange(exchangeName, 'headers', { durable: false });
    
    // Declare the queue
    await channel.assertQueue(queueName, { durable: false });
    
    // Set header bindings
    const headers = {
      priority: 1, // Match messages with priority 1
      type: 'important' // Match messages with type 'important'
    };
    
    // Bind the queue to the exchange with headers
    await channel.bindQueue(queueName, exchangeName, '', headers);
    
    // Consume messages from the queue
    await channel.consume(queueName, (msg) => {
      if (msg !== null) {
        console.log('Received message:', msg.content.toString());
        channel.ack(msg); // Acknowledge the message
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

consumeMessages();
