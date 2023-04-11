const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CLIENT_ID = 'CLIENT-ID-HERE';
const AUTH_TOKEN = 'ACCESS-TOKEN-HERE';
const CATEGORIES = ['Just Chatting'];
const MIN_VIEWERS = 100;

async function fetchGameId(category) {
  try {
    const response = await axios.get(`https://api.twitch.tv/helix/games?name=${category}`, {
      headers: {
        'Client-ID': CLIENT_ID,
        'Authorization': `Bearer ${AUTH_TOKEN}`
      }
    });
    const gameId = response.data.data[0].id;
    console.log(`Scraping Channels From: ${category} | Game ID: ${gameId}`);
    return gameId;
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function fetchChannels(gameId, category) {
  try {
    let channels = [];
    let cursor = null;
    do {
      const response = await axios.get(`https://api.twitch.tv/helix/streams?language=en&game_id=${gameId}&viewer_count=${MIN_VIEWERS}&first=100${cursor ? `&after=${cursor}` : ''}`, {
        headers: {
          'Client-ID': CLIENT_ID,
          'Authorization': `Bearer ${AUTH_TOKEN}`
        }
      });
      channels.push(...response.data.data);
      cursor = response.data.pagination.cursor;
      processChannels(response.data.data, category);
      await new Promise(resolve => setTimeout(resolve, 5000)); // wait for 5 seconds before making the next request
    } while (true);
  } catch (error) {
    console.error(error);
  }
}

function processChannels(channels, category) {
  const channelsDirectory = './channels';
  const filePath = path.join(channelsDirectory, `${category}.txt`);
  const existingChannels = new Set();

  // Create the channels directory if it doesn't exist
  if (!fs.existsSync(channelsDirectory)) {
    fs.mkdirSync(channelsDirectory);
  }

  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    const lines = data.split(/\r?\n/);
    lines.forEach(line => {
      if (line.trim() !== '') {
        existingChannels.add(line.trim());
      }
    });
  }

  const uniqueChannels = channels.filter(channel => !existingChannels.has(channel.user_login));
  uniqueChannels.forEach(channel => {
    const username = channel.user_login;
    console.log(`Found channel: ${username}`);
    fs.appendFile(filePath, `${username}\n`, err => {
      if (err) console.error(err);
      else console.log(`Saved username: ${username}`);
    });
  });
}

async function main() {
  try {
    const promises = CATEGORIES.map(async (category) => {
      const gameId = await fetchGameId(category);
      await fetchChannels(gameId, category);
    });
    await Promise.all(promises);
  } catch (error) {
    console.error(error);
  }
}

main();
