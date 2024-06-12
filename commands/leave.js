const { EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");
const { getVoiceConnection } = require("@discordjs/voice");
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
      const checkChannel = async (dbChannelId) => {
        const isChannelAvailable = interaction.guild.channels.cache.has(dbChannelId);
        if (dbChannelId === null || !isChannelAvailable) {
          return false;
        } else {
          return true;
        }
      };

      // Initial response deferred for later
      await interaction.deferReply();

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

      if (!(await checkChannel(data[0].voicechannel_id))) {
        console.log(data[0]);
        throw {
          name: "Missing Voice Channel to Join",
          message: "Use /set channel to set voice channel for the bot to join.",
        };
      }

      const connection = getVoiceConnection(interaction.guild.id);

      if (!connection) {
        throw {
          name: "Bot not in Voice",
          message: "Bot not connected, use /join",
        };
      }

      connection.destroy();
      // Let user know channel was set [Create Embed, Send Message w/ Embed]
      const leftVoice = new EmbedBuilder()
        .setTitle(`Bot has left voice channel`)
        .setColor(0x0de11b)
        .setFooter({ text: "Made by Dark", iconURL: "https://i.imgur.com/pHxhkDb.png" })
        .setTimestamp();

      await interaction.editReply({
        embeds: [leftVoice],
      });
    } catch (error) {
      console.log({ Guild_ID: interaction.guild.id, Set_Error: error });

      const errorHandlerEmbed = new EmbedBuilder()
        .setTitle(`[${error.name}] ${error.message}`)
        .setDescription(`Message Dark for support`)
        .setColor(0xff0000)
        .setFooter({ text: "Made by Dark", iconURL: "https://i.imgur.com/pHxhkDb.png" })
        .setTimestamp();

      await interaction.followUp({
        embeds: [errorHandlerEmbed],
      });
    }
  },
  data: new SlashCommandBuilder().setName("leave").setDescription("Make tts bot leave voice channel").setDMPermission(false),
};
