# Twitch Channels Scraperr

This is a Node.js program that scrapes Twitch channels based on the specified game category and minimum viewership threshold, and saves the results to a text file. The program uses the Twitch API to fetch the necessary data, This could also be used as a "Username Scraper" for Twitch Lurk Bots.

## Prerequisites

- Node.js v14 or later
- Twitch API client ID and access token

## Installation

1. Clone the repository or download as .zip
2. Install dependencies: `npm install`
3. Update the `CLIENT-ID-HERE`, `ACCESS-TOKEN-HERE` and `CATEGORIES` variables in `index.js` with your Twitch API credentials and desired parameters.
4. Run the program: `node index.js`

## Usage

To use the program, simply run `node index.js` in your terminal or command prompt.

By default, the program scrapes channels for the `Just Chatting` game category with a minimum of 100 viewers. You can change these parameters by updating the `CATEGORIES` and `MIN_VIEWERS` variables in `index.js`.

The program saves the scraped channels to a text file in the `./channels` directory, with a file name corresponding to the game category. For example, channels for the `Just Chatting` category are saved to `./channels/Just Chatting.txt`.

## License

This program is licensed under the MIT License. See the [LICENSE](./LICENSE) file for more information.

## Contributing

Contributions are welcome! If you find a bug or have a feature request, please open an issue on GitHub or submit a pull request.
