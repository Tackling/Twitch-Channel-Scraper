const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CLIENT_ID = 'CLIENT-ID-HERE'; // Replace 'CLIENT-ID-HERE' with your actual Twitch API client ID
const AUTH_TOKEN = 'ACCESS-TOKEN-HERE'; // Replace 'ACCESS-TOKEN-HERE' with your actual Twitch API access token
const CATEGORIES = ['Just Chatting']; // Add more categories by including additional string elements separated by commas
const MIN_VIEWERS = null; // Set a minimum number of viewers to filter streams, or leave as null to disable filtering

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
  const categoryFilePath = path.join(channelsDirectory, `${category.replace(':', '_')}.txt`);
  const allFilePath = path.join(channelsDirectory, 'All.txt');
  const existingChannels = new Set();

  // Create the channels directory if it doesn't exist
  if (!fs.existsSync(channelsDirectory)) {
    fs.mkdirSync(channelsDirectory);
  }

  if (fs.existsSync(allFilePath)) {
    const allData = fs.readFileSync(allFilePath, 'utf8');
    const allLines = allData.split(/\r?\n/);
    allLines.forEach(line => {
      if (line.trim() !== '') {
        existingChannels.add(line.trim());
      }
    });
  }

  const uniqueChannels = channels.filter(channel => !existingChannels.has(channel.user_login));
  uniqueChannels.forEach(channel => {
    const username = channel.user_login;
    console.log(`Found channel: ${username}`);
    fs.appendFile(categoryFilePath, `${username}\n`, err => {
      if (err) console.error(err);
      else console.log(`Saved username: ${username} to ${category}.txt`);
    });
    fs.appendFile(allFilePath, `${username}\n`, err => {
      if (err) console.error(err);
      else console.log(`Saved username: ${username} to All.txt`);
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
