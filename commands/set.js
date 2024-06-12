const { ChannelType, EmbedBuilder, ChatInputCommandInteraction, SlashCommandBuilder } = require("discord.js");
const { createClient } = require("@supabase/supabase-js");
const voices = require("../voices.json");
const supabase = createClient(process.env.DB_URL, process.env.DB_KEY);

module.exports = {
  /**
   * @param {Object} param0
   * @param {ChatInputCommandInteraction} param0.interaction
   */
  run: async ({ interaction }) => {
    const subcommand = interaction.options.getSubcommand();

    try {
      if (!interaction.member.roles.cache.some((role) => role.id === "1179290431549341797"))
        throw { name: "No Permissions", message: "You dont have permission to use this command" };
      const checkChannel = async (dbChannelId) => {
        const isChannelAvailable = interaction.guild.channels.cache.has(dbChannelId);
        if (dbChannelId === null || !isChannelAvailable) {
          return "__**Not Set**__";
        } else {
          return `<#${dbChannelId}>`;
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

      // Guild in database, continue ...

      // Set Text Channel Command
      if (subcommand === "chatroom") {
        // Channel already set to requested change
        const textChannel = interaction.options.data[0].options[0].value;
        let { data, error } = await supabase
          .from("discords")
          .update({ textchannel_id: textChannel })
          .eq("guild_id", interaction.guild.id)
          .select();

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
        const chatroomSetSuccess = new EmbedBuilder()
          .setTitle(`Chatroom Set`)
          .addFields(
            {
              name: "✧ Explanation:",
              value: "The bot will read messages from this text channel and convert to speech if in a voice.",
            },
            { name: " ", value: " " },
            { name: "✧ Current Text Channel:", value: await checkChannel(data[0].textchannel_id), inline: true },
            { name: " ", value: " " },
          )
          .setColor(0x0de11b)
          .setFooter({ text: "Made by Dark", iconURL: "https://i.imgur.com/pHxhkDb.png" })
          .setTimestamp();

        await interaction.editReply({
          embeds: [chatroomSetSuccess],
        });
      }

      // Set Voice Channel Command
      if (subcommand === "voiceroom") {
        // Channel already set to requested change
        const voiceChannel = interaction.options.data[0].options[0].value;
        let { data, error } = await supabase
          .from("discords")
          .update({ voicechannel_id: voiceChannel })
          .eq("guild_id", interaction.guild.id)
          .select();

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
        const channelSetSuccess = new EmbedBuilder()
          .setTitle(`Voice Channel Set`)
          .addFields(
            { name: "✧ Explanation:", value: "The bot will join this voice channel when you use the /join command." },
            { name: " ", value: " " },
            { name: "✧ Current Voice Channel:", value: await checkChannel(data[0].voicechannel_id), inline: true },
            { name: " ", value: " " },
          )
          .setColor(0x0de11b)
          .setFooter({ text: "Made by Dark", iconURL: "https://i.imgur.com/pHxhkDb.png" })
          .setTimestamp();

        await interaction.editReply({
          embeds: [channelSetSuccess],
        });
      }

      // Set Volume Command
      // if (subcommand === "volume") {
      //   const updatedVol = interaction.options.data[0].options[0].value;
      //   let { data, error } = await supabase
      //     .from("discords")
      //     .update({ volume: updatedVol })
      //     .eq("guild_id", interaction.guild.id)
      //     .select();

      //   if (error) {
      //     throw {
      //       type: "Database",
      //       code: error.code,
      //       details: error.details,
      //       hint: error.hint,
      //       message: error.message,
      //       customMessage: "Contact the creator of the bot for help with resolving this.",
      //     };
      //   }

      //   // If no channel id set in database, let the user know

      //   // Let user know channel was set [Create Embed, Send Message w/ Embed]
      //   const volumeSetSuccess = new EmbedBuilder()
      //     .setTitle(`Volume Set`)
      //     .addFields(
      //       { name: "✧ Explanation:", value: "This is the volume the bot will be set at when speaking in the voice channel." },
      //       { name: " ", value: " " },
      //       { name: "✧ Current Volume Level:", value: `${updatedVol}`, inline: true },
      //       { name: " ", value: " " },
      //     )
      //     .setColor(0x0de11b)
      //     .setFooter({ text: "Made by Dark", iconURL: "https://i.imgur.com/pHxhkDb.png" })
      //     .setTimestamp();

      //   await interaction.editReply({
      //     embeds: [volumeSetSuccess],
      //   });
      // }

      // Set Voice Command
      if (subcommand === "voice") {
        const newVoice = interaction.options.data[0].options[0].value;
        let { data, error } = await supabase
          .from("discords")
          .update({ voice: newVoice })
          .eq("guild_id", interaction.guild.id)
          .select();

        if (error) {
          throw {
            type: "Database",
            code: error.code,
            details: error.details,
            hint: error.hint,
            message: error.message,
            customMessage: "Contact the creator of the bot for help with resolving this.",
          };
        }

        // If no channel id set in database, let the user know

        // Let user know channel was set [Create Embed, Send Message w/ Embed]
        const voiceSetSuccess = new EmbedBuilder()
          .setTitle(`Voice Set`)
          .addFields(
            { name: "✧ Explanation:", value: "This is the voice the bot will use when speaking in the voice channel" },
            { name: " ", value: " " },
            { name: "✧ Current Voice:", value: `${newVoice}`, inline: true },
            { name: " ", value: " " },
            // { name: "To test this voice use /voicetest [name]", value: " " },
          )
          .setColor(0x0de11b)
          .setFooter({ text: "Made by Dark", iconURL: "https://i.imgur.com/pHxhkDb.png" })
          .setTimestamp();

        await interaction.editReply({
          embeds: [voiceSetSuccess],
        });
      }
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
    .setName("set")
    .setDescription("Change voice channel, text channel, volume, or voice")
    .setDMPermission(false)
    .addSubcommand((subcommand) =>
      subcommand
        .setName("chatroom")
        .setDescription("Pick a text channel you want the bot to read messages from and turn into speech.")
        .addChannelOption((channel) =>
          channel.setName("channel").setDescription("Text Channel").addChannelTypes(ChannelType.GuildText).setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("voiceroom")
        .setDescription("Pick a voice channel you want the bot to join when you type /join")
        .addChannelOption((channel) =>
          channel.setName("channel").setDescription("Voice Channel").addChannelTypes(ChannelType.GuildVoice).setRequired(true),
        ),
    )
    // .addSubcommand((subcommand) =>
    //   subcommand
    //     .setName("volume")
    //     .setDescription("Enter a number between 0 and 10")
    //     .addIntegerOption((option) =>
    //       option.setName("volume").setDescription("Enter a number between 0 and 10").setMinValue(0).setMaxValue(10),
    //     ),
    // )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("voice")
        .setDescription("Select a voice to use")
        .addStringOption((option) =>
          option.setName("voice").setDescription("Choose a voice to set, to hear voices use /voices command").addChoices(voices),
        ),
    ),
};
