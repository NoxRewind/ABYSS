import 'dotenv/config';
import { Client, GatewayIntentBits, SlashCommandBuilder, Routes, REST, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const token = process.env.TOKEN;
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;

const ip = '178.208.177.20';
const websiteLink = 'https://discord.gg/SCu8bPYKMU';
const authorizedRoleId = '1271925440247758950';
const thumbnailLink = 'https://cdn.discordapp.com/attachments/1309893594064224256/1366175109269946478/animated_2.gif?ex=680ffd38&is=680eabb8&hm=5c336fb5db1bdbe55af67bb9dee0dfa19c2928b9aad54bac522d5a71fbdaf9bf&';

// Başlangıç durumu
let serverStatus = 'kapalı'; // aktif | bakım | kapalı

// Slash komutlarını kaydet
const commands = [
  new SlashCommandBuilder().setName('aktif').setDescription('Sunucunun aktif olduğunu duyurur.'),
  new SlashCommandBuilder().setName('restart').setDescription('Sunucu restart atıyor duyurusu yapar.'),
  new SlashCommandBuilder().setName('bakım').setDescription('Sunucu bakımda duyurusu yapar.'),
  new SlashCommandBuilder().setName('durum').setDescription('Sunucunun mevcut durumunu gösterir.') // herkes kullanabilir
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Slash komutları kaydediliyor...');
    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands }
    );
    console.log('Slash komutları başarıyla kaydedildi.');
  } catch (error) {
    console.error(error);
  }
})();

client.once('ready', () => {
  console.log(`Bot aktif: ${client.user.tag}`);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  // /durum komutu özel: herkes kullanabilir
  if (commandName === 'durum') {
    let durumText = '';
    let color = 0x808080;

    if (serverStatus === 'aktif') {
      durumText = '🟢 Sunucu şu anda **AKTİF**!';
      color = 0x00FF00;
    } else if (serverStatus === 'bakım') {
      durumText = '🟠 Sunucu şu anda **BAKIMDA**!';
      color = 0xFFA500;
    } else {
      durumText = '🔴 Sunucu şu anda **KAPALI**!';
      color = 0xFF0000;
    }

    const embed = new EmbedBuilder()
      .setTitle('Sunucu Durumu')
      .setDescription(durumText)
      .setColor(color)
      .setThumbnail(thumbnailLink)
      .setFooter({ text: 'ABYSS V1 | Durum Bilgilendirmesi', iconURL: thumbnailLink })
      .setTimestamp();

    return await interaction.reply({ embeds: [embed] });
  }

  // Diğer komutlar için yetki kontrolü
  const memberRoles = interaction.member.roles;
  if (!memberRoles.cache.has(authorizedRoleId)) {
    return await interaction.reply({ content: '❌ Bu komutu kullanmak için yetkiniz yok.', ephemeral: true });
  }

  let embed;

  if (commandName === 'aktif') {
    serverStatus = 'aktif'; // DURUMU AKTİF YAP

    embed = new EmbedBuilder()
      .setTitle('ABYSS V1')
      .setDescription(`
Sunucu **AKTİF**, giriş yapabilirsiniz.  
Sunucuya giren herkes kuralları okumuş sayılmaktadır.

• Destek almak için: <#1271925758994026626>  
• Discord Davetimiz: ${websiteLink}

**Bağlantı için:**  
\`\`\`
fivem://connect/${ip}
\`\`\`
      `)
      .addFields(
        { name: 'DURUM', value: '🟢 ONLINE', inline: true },
        { name: 'SUNUCU IP', value: ip, inline: true }
      )
      .setColor(0x00FF00)
      .setThumbnail(thumbnailLink)
      .setFooter({ text: 'ABYSS V1 | Sunucu Bilgilendirmesi', iconURL: thumbnailLink })
      .setTimestamp();
  }

  if (commandName === 'restart') {
    serverStatus = 'kapalı'; // restart da kapalıya alsın mantıken

    embed = new EmbedBuilder()
      .setTitle('ABYSS V1 - Sunucu Yeniden Başlatılıyor')
      .setDescription(`
Sunucu şu anda **restart** atıyor.  
Bir süre giriş yapamayabilirsiniz. Lütfen bekleyin!

Sunucu tamamen açıldığında bilgilendirme yapılacaktır.

**Bağlantı için:**  
\`\`\`
fivem://connect/${ip}
\`\`\`
      `)
      .addFields(
        { name: 'DURUM', value: '🔴 RESTART ATILIYOR', inline: true },
        { name: 'SUNUCU IP', value: ip, inline: true }
      )
      .setColor(0xFF0000)
      .setThumbnail(thumbnailLink)
      .setFooter({ text: 'ABYSS V1 | Sunucu Bilgilendirmesi', iconURL: thumbnailLink })
      .setTimestamp();
  }

  if (commandName === 'bakım') {
    serverStatus = 'bakım'; // DURUMU BAKIMA AL

    embed = new EmbedBuilder()
      .setTitle('ABYSS V1 - Sunucu Bakımda')
      .setDescription(`
Sunucu **bakımda**.  
Bu süre zarfında giriş yapılamamaktadır.  
Lütfen daha sonra tekrar deneyiniz.

• Destek için: <#1271925758994026626>  
• Discord Davetimiz: ${websiteLink}

**Bağlantı için:**  
\`\`\`
fivem://connect/${ip}
\`\`\`
      `)
      .addFields(
        { name: 'DURUM', value: '🟠 BAKIMDA', inline: true },
        { name: 'SUNUCU IP', value: ip, inline: true }
      )
      .setColor(0xFFA500)
      .setThumbnail(thumbnailLink)
      .setFooter({ text: 'ABYSS V1 | Sunucu Bilgilendirmesi', iconURL: thumbnailLink })
      .setTimestamp();
  }

  if (embed) {
    const button = new ButtonBuilder()
      .setLabel('Discord Davetimiz')
      .setStyle(ButtonStyle.Link)
      .setURL(websiteLink);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.reply({ embeds: [embed], components: [row] });
  }
});

client.login(token);
