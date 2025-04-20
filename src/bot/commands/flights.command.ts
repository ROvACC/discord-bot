import { Command, Handler } from '@discord-nestjs/core';
import {
  MessageFlags,
  APIEmbedField,
  InteractionReplyOptions,
} from 'discord.js';
import { Injectable, Logger } from '@nestjs/common';
import { RovaccService } from '../services/rovacc.service';
import { OnlineFlightsApiResponse } from '../types';
import { getISODate } from '../utils/get-formatted-date';

@Command({
  name: 'flights',
  description: 'Lists the online flight to/from any of the LRBB FIR airports',
})
@Injectable()
export class FlightsCommand {
  private readonly logger = new Logger(FlightsCommand.name);

  constructor(private rovaccService: RovaccService) {}

  @Handler()
  async onCommand(): Promise<InteractionReplyOptions> {
    this.logger.log('Live Flight command received');
    const content = await this.rovaccService.getOnlineFlights();
    return {
      flags: MessageFlags.Ephemeral,
      embeds: [
        {
          title: 'ONLINE FLIGHTS',
          description: content ? undefined : 'No fligts online :cry:',
          fields: content ? this.prepareResponse(content) : undefined,
          timestamp: getISODate(),
        },
      ],
    };
  }

  private prepareResponse(
    content: Array<OnlineFlightsApiResponse>,
  ): APIEmbedField[] {
    return content
      .filter((flight) => flight.firs.includes('LRBB'))
      .map((flight) => ({
        name: flight.callsign,
        value: `${flight.origin}-${flight.destination}`,
        inline: true,
      }));
  }
}
