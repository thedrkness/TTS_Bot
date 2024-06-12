const { EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");
const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require("@discordjs/voice");
const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.DB_URL, process.env.DB_KEY);

module.exports = {
  /**
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   * @param {string[]} args
   * @param {*} param3
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
          message: "Use /set voiceroom to set voice channel for the bot to join.",
        };
      } else if (!(await checkChannel(data[0].textchannel_id))) {
        throw {
          name: "Missing Text Channel to Read messages from",
          message: "Use /set chatroom to set text channel for the bot to read from.",
        };
      }

      const connection = joinVoiceChannel({
        channelId: data[0].voicechannel_id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false,
      });

      connection.on(VoiceConnectionStatus.Disconnected, async (oldState, newState) => {
        try {
          await Promise.race([
            entersState(connection, VoiceConnectionStatus.Signalling, 5_000),
            entersState(connection, VoiceConnectionStatus.Connecting, 5_000),
          ]);
          // Seems to be reconnecting to a new channel - ignore disconnect
        } catch (error) {
          // Seems to be a real disconnect which SHOULDN'T be recovered from
          connection.destroy();
        }
      });

      // Let user know channel was set [Create Embed, Send Message w/ Embed]
      const joinedVoice = new EmbedBuilder()
        .setTitle(`Joined Voice Channel <#${data[0].voicechannel_id}>`)
        .setColor(0x0de11b)
        .setFooter({ text: "Made by Dark", iconURL: "https://i.imgur.com/pHxhkDb.png" })
        .setTimestamp();

      await interaction.editReply({
        embeds: [joinedVoice],
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
  data: new SlashCommandBuilder().setName("join").setDescription("Will join set voice channel").setDMPermission(false),
};
