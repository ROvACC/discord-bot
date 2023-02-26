import { DiscordModule } from '@discord-nestjs/core';
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AtcCommand } from './commands/atc.command';
import { BookingListCommand } from './commands/booking-list.command';
import { FlightsCommand } from './commands/flights.command';
import { MetarCommand } from './commands/metar.command';
import { PingCommand } from './commands/ping.command';
import { RovaccService } from './services/rovacc.service';
import { VatsimService } from './services/vatsim.service';

@Module({
  imports: [HttpModule, DiscordModule.forFeature()],
  providers: [
    PingCommand,
    MetarCommand,
    AtcCommand,
    FlightsCommand,
    BookingListCommand,
    VatsimService,
    RovaccService,
  ],
})
export class BotSlashCommandsModule {}
