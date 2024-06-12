require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const { Client, Partials, GatewayIntentBits } = require("discord.js");
const path = require("path");
const { CommandKit } = require("commandkit");
const voice = require("@discordjs/voice");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

new CommandKit({
  client,
  commandsPath: path.join(__dirname, "commands"),
  devUserIds: ["667619257168691200"],
  bulkRegister: true,
});

client.on("error", (e) => {
  console.log({ General_Error: e });
});

const supabase = createClient(process.env.DB_URL, process.env.DB_KEY);

let player = voice.createAudioPlayer({
  behaviors: {
    noSubscriber: voice.NoSubscriberBehavior.Play,
  },
});

let queue = [];

const playNextInQueue = () => {
  if (queue.length === 0) return;

  play(queue[0].guild, queue[0].url);
};

const play = async (guild, url) => {
  const connection = voice.getVoiceConnection(guild);

  if (connection) {
    console.log(queue);
    if (queue.length > 0) queue.shift();

    console.log(queue);

    let stream = (await (await fetch(url)).blob()).stream();
    const resource = voice.createAudioResource(stream);
    connection.subscribe(player);

    if (player.state.status === "idle") player.play(resource);
  }
};

player.on(voice.AudioPlayerStatus.Idle, (oldState, newState) => {
  playNextInQueue();
});

// On Bot Leave, clear queue
client.on("voiceStateUpdate", (oldState, newState) => {
  if (newState.member.id === "1248754776934584380") {
    if (newState.channelId === null) {
      queue = [];
      console.log("cleared queue");
    }
  }
});

// New Message for Text to Speech
client.on("messageCreate", async (message) => {
  const connection = voice.getVoiceConnection(message.guildId);
  if (!connection || message.author.bot) return;

  const { data, error } = await supabase.from("discords").select().eq("guild_id", message.guildId);
  if (error) throw new Error("Error fetching guild data");

  if (message.channelId !== data[0].textchannel_id) return;

  const urlMessage = `https://api.streamelements.com/kappa/v2/speech?voice=${data[0].voice}&text=${encodeURIComponent(message)}`;
  queue.push({
    guild: message.guildId,
    url: urlMessage,
  });

  if (player.state.status === "idle") {
    play(message.guildId, urlMessage);
  }
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

module.exports = { queue, play, playNextInQueue, player, voice };
