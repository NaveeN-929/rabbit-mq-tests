// library
import moment from 'moment/moment.js';
import Sequelize, { Op } from 'sequelize';

// project
import { redisClient, rmqConnection } from '../config/db.js';
import SettlementTxn from '../model/pg/SettlementTxn.js';
import errorHandler from '../utils/errorHandler.js';

const exchange = 'chain.stake';

// amqp.connect('amqp://guest:guest@amq.copperbet.com:5672/');

const channel = await rmqConnection.createChannel();
channel.assertExchange(exchange, 'topic', { durable: false });
const queue = await channel.assertQueue('', {
  exclusive: true,
});

channel.bindQueue(queue.queue, exchange, 'status');

// callback function
channel.consume(
  queue.queue,
  (msg) => {
    switch (msg.fields.routingKey) {
      case 'status':
        onSettlementStatus(msg.content.toString());
        break;
      case 'notification':
        onSettled(msg.content.toString());
        break;
      default: {
        console.log('undefined routing key');
      }
    }
  },
  { noAck: true }
);

/**
 * every time settlement is completed, update the leader board
 * @param {string} message
 * true || false -> settlement started 'true', settlement completed 'false'
 */
const onSettlementStatus = (message) =>
  errorHandler(async () => {
    const settlementOver = message === 'false';

    if (!settlementOver) {
      return;
    }

    // last 1 week user's total settlements
    const settlements = await SettlementTxn.findAll({
      where: {
        createdAt: { [Op.gte]: moment().subtract(100, 'weeks').toDate() },
      },
      attributes: [
        'to_user_id',
        [Sequelize.fn('sum', Sequelize.col('lamports')), 'lamports'],
      ],
      group: ['to_user_id'],
      order: [['lamports', 'DESC']],
    });

    if (settlements.length > 0) {
      const redisPipeline = redisClient.pipeline();
      redisPipeline.del('weekly:leaderboard');
      redisPipeline.zadd(
        'weekly:leaderboard',
        ...settlements.map(({ lamports, to_user_id }) => [
          parseFloat((lamports * 0.000000001).toFixed(2)),
          to_user_id,
        ])
      );

      redisClient.connectOnNeed();
      await redisPipeline.exec();
      redisClient.resetConnectionTimer();
    }

    console.log(
      `weekly leader board updated with ${settlements.length} user(s)`
    );
  });

/**
 * once the settlement is done for the user increase user's score
 * @param {string} message
 * {
 *    "to_user_id": "6461ca4bb635abb57baece12",
 *   "from_wallet": "6jx66XDh8MYEBqn6YMsaYUfm9D4ZvwtswFfeY7DsY39K",
 *   "to_wallet": "9CG4qZyV7NLSSgqpfSVdX5QhCnK6NyL2Ja12KVDJdwpy",
 *   "lamports": 1960000000,
 *   "hash": "4euVjYZ3SQF3g476gvCKQjBeCiNZazR6RnVTFNfHCczmWkPYp7mFrrpeJQYg8FgmmfGDp5JDYuBHjqjgcYd2cpKL",
 *   "bet_id": "644bbb26e54c1e4b1fba4b02",
 *   "stake_id": "6461ca4bb635abb57baecefd"
 * }
 */
const onSettled = (message) =>
  errorHandler(async () => {
    const { to_user_id: userId, lamports } = JSON.parse(message);

    redisClient.connectOnNeed();
    await redisClient.zincrby(
      'alltime:leaderboard',
      parseFloat((lamports * 0.000000001).toFixed(2)),
      userId
    );
    redisClient.resetConnectionTimer();
    console.log(`Score updated for user ${userId}`.green);
  });
