const { EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");
let { queue, player } = require("../main");

module.exports = {
  /**
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  run: async ({ interaction }) => {
    try {
      if (!interaction.member.roles.cache.some((role) => role.id === "1179290431549341797"))
        throw { name: "No Permissions", message: "You dont have permission to use this command" };
      // Initial response deferred for later
      await interaction.deferReply();

      if (queue.length === 0 && player.state.status === "idle") {
        throw {
          name: "No TTS in Queue",
          message: "There is no TTS in queue, type in the text channel set to send Text to Speech.",
        };
      }

      player.stop();

      const skippedVoice = new EmbedBuilder()
        .setTitle(`TTS Skipped`)
        .setDescription("TTS Message was skipped!")
        .setColor(0x0de11b)
        .setFooter({ text: "Made by Dark", iconURL: "https://i.imgur.com/pHxhkDb.png" })
        .setTimestamp();

      await interaction.editReply({
        embeds: [skippedVoice],
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
  data: new SlashCommandBuilder().setName("skip").setDescription("Skip currently playing tts").setDMPermission(false),
};
