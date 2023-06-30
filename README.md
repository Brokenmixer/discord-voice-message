# Discord Voice Messages (Simplified)
This is a GitHub repository where you can transform .mp3 file to Discord voice messages.

# How it works?
I simplified the code from [this repository](https://github.com/kbd0t/Discord-Voice-Secret-Message).

In this repository, I randomized the waveform and the filename, so all you need is to just upload your .mp3 file somewhere else, put it on the .env file, and transform it.

# Installation
- Install the module, `npm install`
  - If you're using another package manager, `pnpm install` or `yarn install` is basically the same thing.
- Turn `.env.example` to `.env`
- Input your data into the string in your `.env`
  - `DISCORD_TOKEN` is your Discord user token, not bot.
    - You can get it from inspect element.
  - `DISCORD_CHANNEL_ID` is a text channel you want to send.
  - `AUDIO_URL` is a full URL of your .mp3 file. 
    - You can upload it and copy the link into `AUDIO_URL`
- Run the terminal, and simply type `node .`

# Risk
This script is not meant to be used for malicious purposes. I don't have any responsible for anything you do with this script.

# LICENSE
[Unlicense](LICENSE)