import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  InteractionResponseFlags,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { VerifyDiscordRequest, getRandomEmoji, DiscordRequest } from './utils.js';
import { getShuffledOptions, getResult } from './game.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;
// Parse request body and verifies incoming requests using discord-interactions package
app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

// Store for in-progress games. In production, you'd want to use a DB
const activeGames = {};

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 */
app.post('/interactions', async function (req, res) {
  // Interaction type and data
  const { type, id, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: 'hello world Leo' + getRandomEmoji(),
        },
      });
    }
    // "roll" command
    if (name === 'roll') {
      const message = data.options[0].value;
      let parts = message.split(' ').join('').split(/(\+|\*)/);
      const [numDice, numSides] = parts[0].split('d');
      const result = [];
    
      let modifierSum = 0;
      let multiplierProduct = 1;
      let modifierDetails = [];
      let multiplierDetails = [];
    
      for (let i = 1; i < parts.length; i += 2) {
        let number, description;
        if (parts[i] === '+') {
          [number, description] = parts[i+1].split('(');
          number = parseInt(number.trim());
          modifierSum += number;
          modifierDetails.push({number, description: description ? description.slice(0, -1) : ''});
        } else if (parts[i] === '*') {
          [number, description] = parts[i+1].split('(');
          number = parseInt(number.trim());
          multiplierProduct *= number;
          multiplierDetails.push({number, description: description ? description.slice(0, -1) : ''});
        }
      }
    
      let sum = 0;
      for (let i = 0; i < numDice; i++) {
        const roll = Math.floor(Math.random() * numSides) + 1;
        sum += roll;
        result.push(roll);
      }
    
      sum = (sum + modifierSum) * multiplierProduct;
    
      let content = `You rolled ${message} : ${result.map(r => `🎲${r}`).join(', ')}`;
    
      if (modifierDetails.length > 0) {
        content += ` + ${modifierDetails.map(mod => `${mod.number}${mod.description ? `(${mod.description})` : ''}`).join(' + ')}`;
      }
    
      if (multiplierDetails.length > 0) {
        content += ` \\* ${multiplierDetails.map(mult => `${mult.number}${mult.description ? `(${mult.description})` : ''}`).join(' \\* ')}`;
      }
    
      content += ` = ${sum}.`;
    
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          content: content,
        },
      });
    }
  }
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
