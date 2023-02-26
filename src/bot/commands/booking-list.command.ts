import { Command, Handler } from '@discord-nestjs/core';
import { APIEmbedField, InteractionReplyOptions } from 'discord.js';
import { Injectable, Logger } from '@nestjs/common';
import { RovaccService } from '../services/rovacc.service';
import { FutureBookingsApiResponse } from '../types';
import { getISODate } from '../utils/get-formatted-date';

@Command({
  name: 'booking-list',
  description: 'List of bookings for the next 48 hours',
})
@Injectable()
export class BookingListCommand {
  private readonly logger = new Logger(BookingListCommand.name);

  constructor(private rovaccService: RovaccService) {}

  @Handler()
  async onCommand(): Promise<InteractionReplyOptions> {
    this.logger.log('Booking list command received');
    const content = await this.rovaccService.getFutureBookings();
    console.log(content);
    return {
      ephemeral: true,
      embeds: [
        {
          title: 'BOOKINGS IN THE NEXT 48 HOURS',
          description: content ? undefined : 'No bookings registered :cry:',
          fields: content ? this.prepareResponse(content) : undefined,
          timestamp: getISODate(),
        },
      ],
    };
  }

  private prepareResponse(
    content: Array<FutureBookingsApiResponse>,
  ): APIEmbedField[] {
    return content.map((booking) => ({
      name: `${booking.callsign} (${booking.name})`,
      value: `${booking.date} / ${booking.timeStart}-${booking.timeStop}`,
      inline: true,
    }));
  }
}
