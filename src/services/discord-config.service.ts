import { Injectable } from '@nestjs/common';
import {
  DiscordModuleOption,
  DiscordOptionsFactory,
} from '@discord-nestjs/core';
import { GatewayIntentBits } from 'discord.js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class DiscordConfigService implements DiscordOptionsFactory {
  constructor(private configService: ConfigService) {}
  createDiscordOptions(): DiscordModuleOption {
    return {
      token: this.configService.get('discordToken'),
      discordClientOptions: {
        intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.Guilds],
      },
    };
  }
}
