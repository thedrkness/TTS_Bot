const { EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");
let { queue, play, voice, player } = require("../main");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.DB_URL, process.env.DB_KEY);
module.exports = {
  /**
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  run: async ({ interaction }) => {
    try {
      if (!interaction.member.roles.cache.some((role) => role.id === "1179290431549341797"))
        throw { name: "No Permissions", message: "You dont have permission to use this command" };
      const message = interaction.options.data[0].value;
      const connection = voice.getVoiceConnection(interaction.guildId);
      if (!connection || interaction.user.bot)
        throw { name: "Bot not in Voice", message: "Use /join for the bot to join a voice channel" };

      const { data, error } = await supabase.from("discords").select().eq("guild_id", interaction.guildId);
      if (error) throw new Error("Error fetching guild data");

      // Initial response deferred for later
      await interaction.deferReply();

      const urlMessage = `https://api.streamelements.com/kappa/v2/speech?voice=${data[0].voice}&text=${encodeURIComponent(message)}`;

      console.log(urlMessage);
      queue.push({
        guild: interaction.guildId,
        url: urlMessage,
      });

      if (player.state.status === "idle") {
        play(interaction.guildId, urlMessage);
      }

      // Send message that tts is queued
      const availableVoices = new EmbedBuilder()
        .setTitle(`${queue.length === 0 ? "TTS sent!" : "TTS Queued"}`)
        .addFields(
          {
            name: "✧ Explanation:",
            value: `${queue.length === 0 ? "TTS is playing right now" : "TTS was queued and will play after current messages finish."}`,
          },
          { name: " ", value: " " },
        )
        .setColor(0x0de11b)
        .setFooter({ text: "Made by Dark", iconURL: "https://i.imgur.com/pHxhkDb.png" })
        .setTimestamp();

      await interaction.editReply({
        embeds: [availableVoices],
      });
    } catch (error) {
      console.log({ Guild_ID: interaction.guild.id, Set_Error: error });

      const errorHandlerEmbed = new EmbedBuilder()
        .setTitle(`[${error.name}] ${error.message}`)
        .setDescription(`Message Dark for support`)
        .setColor(0xff0000)
        .setFooter({ text: "Made by Dark", iconURL: "https://i.imgur.com/pHxhkDb.png" })
        .setTimestamp();

      await interaction.reply({
        embeds: [errorHandlerEmbed],
      });
    }
  },
  data: new SlashCommandBuilder()
    .setName("tts")
    .setDescription("Play a single tts message if bot in voice")
    .addStringOption((option) =>
      option.setName("message").setDescription("This message will play after queue is empty or now.").setRequired(true),
    )
    .setDMPermission(false),
};
