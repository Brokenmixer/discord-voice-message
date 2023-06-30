require("dotenv/config");

const { request } = require("undici");
const { randomBytes } = require("node:crypto");
const analyzeAudioDuration = require('get-mp3-duration');

// this is a fixed property that i wont recommend you to change them, unless you know what you're doing
const randomNumber = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
const messageFlag = 1 << 13;
const superProperties = "eyJvcyI6IiIsImJyb3dzZXIiOiIiLCJkZXZpY2UiOiIiLCJzeXN0ZW1fbG9jYWxlIjoiIiwiYnJvd3Nlcl91c2VyX2FnZW50IjoiIiwiYnJvd3Nlcl92ZXJzaW9uIjoiIiwib3NfdmVyc2lvbiI6IiIsInJlZmVycmVyIjoiIiwicmVmZXJyaW5nX2RvbWFpbiI6IiIsInJlZmVycmVyX2N1cnJlbnQiOiIiLCJyZWZlcnJpbmdfZG9tYWluX2N1cnJlbnQiOiIiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfYnVpbGRfbnVtYmVyIjoxODk2MTcsImNsaWVudF9ldmVudF9zb3VyY2UiOm51bGwsImRlc2lnbl9pZCI6MH0=";
const VERSION = 10;
const randomlyGeneratedFilename = randomBytes(randomNumber(8, 24)).toString("hex") + ".mp3";
const [token, channelID, audioURL] = [process.env.DISCORD_TOKEN, process.env.DISCORD_CHANNEL_ID, process.env.AUDIO_URL];
let defaultSecondsLength = 5;

async function club() {
  const uploadedFilename = await uploadAudio(channelID);
  if (!uploadedFilename) throw new Error("No uploaded filename received.");

  return await createMessage(uploadedFilename);
};

async function createMessage(filename) {
  const url = `https://discord.com/api/v${VERSION}/channels/${channelID}/messages`;

  const headers = {
    "content-type": "application/json",
    "Authorization": token,
    "x-super-properties": superProperties
  };

  const experimentalWaveformMessage = randomBytes(randomNumber(8, 24)).toString("hex"); // draft

  const req = await request(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      flags: messageFlag,
      attachments: [{
        id: "0",
        description: "",
        filename: randomlyGeneratedFilename,
        uploaded_filename: filename,
        duration_secs: defaultSecondsLength,
        waveform: encodeMessage(experimentalWaveformMessage)[1],
        content_type: "audio/mpeg",
      }]
    })
  });

  return [req.statusCode === 200, await req.body.json()];
};

async function uploadAudio() {
  const url = `https://discord.com/api/v${VERSION}/channels/${channelID}/attachments`;

  const headers = {
    "content-type": "application/json",
    "Authorization": token
  };

  const data = {
    files: [{
      filename: randomlyGeneratedFilename,
      file_size: 1337,
      id: 16
    }]
  };

  const retrieveAudioData = await request(audioURL, { method: "GET" });
  if (retrieveAudioData.statusCode !== 200) {
    throw new Error(`Unable to retrieve audio data from desired URL with error code ${retrieveAudioData.statusCode}`);
  };

  const bufferedAudioData = Buffer.from(await retrieveAudioData.body.arrayBuffer());
  const durationReplacement = analyzeAudioDuration(bufferedAudioData)
  if (typeof durationReplacement === "number") {
    defaultSecondsLength = Math.round(durationReplacement / 1000);
  };

  const uploadRequest = await request(url, {
    method: "POST", headers,
    body: JSON.stringify(data)
  });

  if (uploadRequest.statusCode !== 200) {
    throw new Error(`Unable to upload the content via POST with error code ${uploadRequest.statusCode}`);
  };

  const uploadURLJSON = await uploadRequest.body.json();
  const uploadURL = uploadURLJSON?.attachments?.[0]?.upload_url;
  if (!uploadURL) {
    throw new Error("Unable to retrieve upload URL.");
  };

  const uploadContentToDesiredURL = await request(uploadURL, {
    method: "PUT",
    body: bufferedAudioData,
    headers: {
      "Content-Type": "audio/mpeg"
    }
  });

  if (uploadContentToDesiredURL.statusCode !== 200) {
    throw new Error(`Unable to upload content to desired URL with error code ${uploadContentToDesiredURL.statusCode}`);
  };

  return uploadURLJSON?.attachments?.[0]?.upload_filename;
};

function encodeMessage(message) {
  const splitter = '21133712';
  const genRanHex = (size) => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join("");

  const hexed = genRanHex(randomNumber(10,30)).replace(new RegExp(splitter, 'g'), genRanHex(splitter.length)) + splitter + Buffer.from(message, 'utf-8').toString("hex").match(/.{1,2}/g).reverse().join('') + splitter + genRanHex(30).replace(new RegExp(splitter, 'g'), genRanHex(randomNumber(10,30)));
  const base64 = Buffer.from(hexed, "hex").toString("base64");

  return [hexed, base64];
};

club();