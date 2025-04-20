import { BookingListCommand } from './booking-list.command';
import { RovaccService } from '../services/rovacc.service';
import { InteractionReplyOptions, MessageFlags } from 'discord.js';
import { FutureBookingsApiResponse } from '../types';
import * as dateUtils from '../utils/get-formatted-date';

// Create a mock for the RovaccService
const mockRovaccService = {
  getFutureBookings: jest.fn(),
};

// Mock the date utility
jest.mock('../utils/get-formatted-date', () => ({
  getISODate: jest.fn(),
}));

describe('BookingListCommand', () => {
  let command: BookingListCommand;
  const mockIsoDate = '2023-04-20T12:00:00.000Z';

  beforeEach(() => {
    // Create an instance of BookingListCommand with the mock RovaccService
    command = new BookingListCommand(
      mockRovaccService as unknown as RovaccService,
    );

    // Clear mock calls between tests
    jest.clearAllMocks();

    // Setup mock date
    (dateUtils.getISODate as jest.Mock).mockReturnValue(mockIsoDate);
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  describe('onCommand', () => {
    it('should return booking data when bookings are available', async () => {
      // Arrange
      const mockBookings: FutureBookingsApiResponse[] = [
        {
          callsign: 'LROP_TWR',
          name: 'John Doe',
          fir: 'LRBB',
          date: '2023-04-21',
          timeStart: '10:00',
          timeStop: '12:00',
        },
        {
          callsign: 'LRCL_APP',
          name: 'Jane Smith',
          fir: 'LRBB',
          date: '2023-04-21',
          timeStart: '14:00',
          timeStop: '16:00',
        },
      ];

      const expectedResponse: InteractionReplyOptions = {
        flags: MessageFlags.Ephemeral,
        embeds: [
          {
            title: 'BOOKINGS IN THE NEXT 48 HOURS',
            fields: [
              {
                name: 'LROP_TWR (John Doe)',
                value: '2023-04-21 / 10:00-12:00',
                inline: true,
              },
              {
                name: 'LRCL_APP (Jane Smith)',
                value: '2023-04-21 / 14:00-16:00',
                inline: true,
              },
            ],
            timestamp: mockIsoDate,
          },
        ],
      };

      mockRovaccService.getFutureBookings.mockResolvedValue(mockBookings);

      // Act
      const result = await command.onCommand();

      // Assert
      expect(mockRovaccService.getFutureBookings).toHaveBeenCalled();
      expect(dateUtils.getISODate).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it('should return no bookings message when no bookings are available', async () => {
      // Arrange
      const mockBookings: FutureBookingsApiResponse[] = [];

      const expectedResponse: InteractionReplyOptions = {
        flags: MessageFlags.Ephemeral,
        embeds: [
          {
            title: 'BOOKINGS IN THE NEXT 48 HOURS',
            description: undefined,
            fields: [],
            timestamp: mockIsoDate,
          },
        ],
      };

      mockRovaccService.getFutureBookings.mockResolvedValue(mockBookings);

      // Act
      const result = await command.onCommand();

      // Assert
      expect(mockRovaccService.getFutureBookings).toHaveBeenCalled();
      expect(dateUtils.getISODate).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it('should propagate errors from the service', async () => {
      // Arrange
      const mockError = new Error('Service error');
      mockRovaccService.getFutureBookings.mockRejectedValue(mockError);

      // Act & Assert
      await expect(command.onCommand()).rejects.toThrow(mockError);
      expect(mockRovaccService.getFutureBookings).toHaveBeenCalled();
    });
  });

  describe('prepareResponse', () => {
    it('should properly format booking data', () => {
      // Arrange
      const mockBookings: FutureBookingsApiResponse[] = [
        {
          callsign: 'LROP_TWR',
          name: 'John Doe',
          fir: 'LRBB',
          date: '2023-04-21',
          timeStart: '10:00',
          timeStop: '12:00',
        },
        {
          callsign: 'LRCL_APP',
          name: 'Jane Smith',
          fir: 'LRBB',
          date: '2023-04-21',
          timeStart: '14:00',
          timeStop: '16:00',
        },
      ];

      const expectedFields = [
        {
          name: 'LROP_TWR (John Doe)',
          value: '2023-04-21 / 10:00-12:00',
          inline: true,
        },
        {
          name: 'LRCL_APP (Jane Smith)',
          value: '2023-04-21 / 14:00-16:00',
          inline: true,
        },
      ];

      // Act
      const result = command['prepareResponse'](mockBookings);

      // Assert
      expect(result).toEqual(expectedFields);
      expect(result.length).toBe(2);
    });

    it('should return empty array when no bookings available', () => {
      // Arrange
      const mockBookings: FutureBookingsApiResponse[] = [];

      // Act
      const result = command['prepareResponse'](mockBookings);

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });
});
