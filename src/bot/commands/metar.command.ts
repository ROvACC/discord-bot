import {
  Command,
  Handler,
  InteractionEvent,
  Param,
} from '@discord-nestjs/core';
import { SlashCommandPipe } from '@discord-nestjs/common';
import { InteractionReplyOptions, MessageFlags } from 'discord.js';
import { Injectable, Logger } from '@nestjs/common';
import { VatsimService } from '../services/vatsim.service';

export class MetarDto {
  @Param({ description: 'ICAO code', required: true })
  icao: string;
}

@Command({
  name: 'metar',
  description: 'Get METAR for an ICAO',
})
@Injectable()
export class MetarCommand {
  private readonly logger = new Logger(MetarCommand.name);

  constructor(private vatsimService: VatsimService) {}

  @Handler()
  async onCommand(
    @InteractionEvent(SlashCommandPipe) options: MetarDto,
  ): Promise<InteractionReplyOptions> {
    this.logger.log(`Metar command received for ${options.icao}`);
    const metar = await this.vatsimService.getMetar(options.icao);
    return {
      flags: MessageFlags.Ephemeral,
      embeds: [
        {
          title: `METAR FOR ${options.icao}`,
          description: metar,
        },
      ],
    };
  }
}
