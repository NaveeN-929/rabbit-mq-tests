const amqp = require('amqplib');

// Connect to RabbitMQ server
const connectionPromise = amqp.connect('amqp://ctech:ctech@amq.copperbet.com:5672/ctech-vhost');

// Function to publish the results
async function publishResults(results) {
  try {
    // Create a channel
    const connection = await connectionPromise;
    const channel = await connection.createChannel();

    const exchange = 'sports_results';

    // Assert the exchange
    await channel.assertExchange(exchange, 'fanout', { durable: false });

    // Publish the results to the exchange
    channel.publish(exchange, '', Buffer.from(results));
    console.log('Results published:', results);

    // Close the connection
    // await channel.close();
    // await connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

// Usage: Call the publishResults function with the results of the sport event
const results = '{ "bet_ID" : "644a6c91e54c1e4b1fba49d7", "Choice": "1 }';
publishResults(results);
