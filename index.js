import chalk from 'chalk';
import inquirer from 'inquirer';

import { boot, getSessionsForDay } from './lib/api.js';
import { getToday, nextDay, printDate } from './lib/date.js';

const printDay = async (date) => {
  console.log(`\n${printDate(date)}`);
  const sessions = await getSessionsForDay(date);
  sessions.forEach((session) => {
    const highlight = session.availableSeats ? chalk.green : chalk;
    console.log(highlight(`${session.name}: ${session.availableSeats}`));
  });
  return sessions;
};

const MODES = {
  WEEK: 'Sessions this week',
  NEXT: 'Next available session',
};

const printDays = async (numDays = 7) => {
  let date = getToday();
  while (numDays--) {
    await printDay(date);
    date = nextDay(date);
  }
};

const findAnAvailableSession = async (maxDays = 14) => {
  let date = getToday();
  while (maxDays--) {
    console.log(`checking ${printDate(date)}...`);
    const sessions = await getSessionsForDay(date);
    const available = sessions.find((session) => session.availableSeats);
    if (available) {
      console.log(
        chalk.green(`${available.name}: ${available.availableSeats} available`)
      );
      return true;
    } else {
      console.log(`no sessions available for ${printDate(date)}`);
      date = nextDay(date);
    }
  }
  return false;
};

const run = async () => {
  await boot();

  const prompt = await inquirer.prompt([
    {
      name: 'mode',
      type: 'list',
      choices: Object.values(MODES),
    },
  ]);

  switch (prompt.mode) {
    case MODES.WEEK:
      return printDays(7);
    case MODES.NEXT:
      return findAnAvailableSession();
    default:
      return;
  }
};

run();