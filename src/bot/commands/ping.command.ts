import { Command, Handler } from '@discord-nestjs/core';
import { InteractionReplyOptions } from 'discord.js';
import { MessageFlags } from 'discord.js';
import { Injectable, Logger } from '@nestjs/common';

@Command({
  name: 'ping',
  description: 'Play ping-pong with the bot',
})
@Injectable()
export class PingCommand {
  private readonly logger = new Logger(PingCommand.name);
  @Handler()
  onCommand(): InteractionReplyOptions {
    this.logger.log('Ping command received');
    return {
      flags: MessageFlags.Ephemeral,
      content: 'Pong!',
    };
  }
}
