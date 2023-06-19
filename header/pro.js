const amqp = require('amqplib');

async function produceMessage() {
  try {
    const connection = await amqp.connect('amqp://guest:guest@amq.copperbet.com:5672/');
    const channel = await connection.createChannel();
    
    const exchangeName = 'test';
    const routingKey = ''; // Empty routing key for header exchange
    
    // Declare the header exchange
    await channel.assertExchange(exchangeName, 'headers', { durable: false });
    
    // Set message headers
    const headers = {
      priority: 1,
      type: 'important'
    };
    
    // Message content
    const message = 'Hello, RabbitMQ!';
    
    // Publish the message with headers
    await channel.publish(exchangeName, routingKey, Buffer.from(message), { headers });
    console.log('Message sent:', message);
    
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

produceMessage();
