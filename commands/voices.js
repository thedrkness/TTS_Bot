const { EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");
const { createClient } = require("@supabase/supabase-js");
const voices = require("../voices.json");
const supabase = createClient(process.env.DB_URL, process.env.DB_KEY);

module.exports = {
  /**
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  run: async ({ interaction }) => {
    try {
      // Initial response deferred for later
      await interaction.deferReply({ ephemeral: true });

      // Channel Selected has all permissions needed...
      // Bot has all permissions... continue
      let { data, error } = await supabase.from("discords").select().eq("guild_id", interaction.guildId);

      if (error) {
        throw {
          type: "Database",
          code: error.code,
          details: error.details,
          hint: error.hint,
          message: error.message,
          customMessage: "Contact the creator of the bot for help with resolving this.",
        };
      } else if (data.length === 0) {
        throw {
          type: "Database",
          customMessage: "Guild was not found in our database. Try kicking the bot and re-adding it.",
        };
      }

      // Let user know channel was set [Create Embed, Send Message w/ Embed]
      const availableVoices = new EmbedBuilder()
        .setTitle(`Available Voices`)
        .addFields(
          { name: "✧ Available Voices:", value: `${voices.map((name) => ` ${name.name} (${name.language})`)}` },
          { name: " ", value: " " },
          { name: "✧ Test Voices:", value: "Go to https://lazypy.ro/tts/" },
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
        .setTitle(`Error setting channel`)
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
    .setName("voices")
    .setDescription("View all available voices and hear them")
    .setDMPermission(false),
};
