import 'dotenv/config';
import { getRPSChoices } from './game.js';
import { capitalize, InstallGlobalCommands } from './utils.js';

// Get the game choices from game.js
function createCommandChoices() {
  const choices = getRPSChoices();
  const commandChoices = [];

  for (let choice of choices) {
    commandChoices.push({
      name: capitalize(choice),
      value: choice.toLowerCase(),
    });
  }

  return commandChoices;
}

// Simple test command
const TEST_COMMAND = {
  name: 'test',
  description: 'Basic command',
  type: 1,
};

// Command containing options
const CHALLENGE_COMMAND = {
  name: 'challenge',
  description: 'Challenge to a match of rock paper scissors',
  options: [
    {
      type: 3,
      name: 'object',
      description: 'Pick your object',
      required: true,
      choices: createCommandChoices(),
    },
  ],
  type: 1,
};

const ROLL_COMMAND = {
  name: 'roll',
  description: 'Rolls a specified number of dice with a specified number of sides',
  options: [
    {
      type: 1,
      name: 'Rolls',
      description: '1d100',
      required: true,
    },
  ],
  type: 1,
};

const ALL_COMMANDS = [TEST_COMMAND, CHALLENGE_COMMAND, ROLL_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);