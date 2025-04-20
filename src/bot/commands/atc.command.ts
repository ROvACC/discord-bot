import { Command, Handler } from '@discord-nestjs/core';
import { APIEmbedField, InteractionReplyOptions } from 'discord.js';
import { MessageFlags } from 'discord.js';
import { Injectable, Logger } from '@nestjs/common';
import { RovaccService } from '../services/rovacc.service';
import { OnlineAtcApiResponse } from '../types';
import { getISODate } from '../utils/get-formatted-date';

@Command({
  name: 'atc',
  description: 'Get online ATC connected to VATSIM',
})
@Injectable()
export class AtcCommand {
  private readonly logger = new Logger(AtcCommand.name);

  constructor(private rovaccService: RovaccService) {}

  @Handler()
  async onCommand(): Promise<InteractionReplyOptions> {
    this.logger.log('ATC command received');
    const content = await this.rovaccService.getOnlineAtc();
    return {
      flags: MessageFlags.Ephemeral,
      embeds: [
        {
          title: 'ONLINE ATC',
          description: content ? undefined : 'No ATC online :cry:',
          fields: content ? this.prepareResponse(content) : undefined,
          timestamp: getISODate(),
        },
      ],
    };
  }

  private prepareResponse(
    content: Array<OnlineAtcApiResponse>,
  ): APIEmbedField[] {
    return content.map((crt) => ({
      name: `${crt.callsign} (${crt.frequency})`,
      value: crt.name,
    }));
  }
}
