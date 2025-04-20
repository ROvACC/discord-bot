import { FlightsCommand } from './flights.command';
import { RovaccService } from '../services/rovacc.service';
import { InteractionReplyOptions, MessageFlags } from 'discord.js';
import { OnlineFlightsApiResponse } from '../types';
import * as dateUtils from '../utils/get-formatted-date';

// Create a mock for the RovaccService
const mockRovaccService = {
  getOnlineFlights: jest.fn(),
};

// Mock the date utility
jest.mock('../utils/get-formatted-date', () => ({
  getISODate: jest.fn(),
}));

describe('FlightsCommand', () => {
  let command: FlightsCommand;
  const mockIsoDate = '2023-04-20T12:00:00.000Z';

  beforeEach(() => {
    // Create an instance of FlightsCommand with the mock RovaccService
    command = new FlightsCommand(mockRovaccService as unknown as RovaccService);

    // Clear mock calls between tests
    jest.clearAllMocks();

    // Setup mock date
    (dateUtils.getISODate as jest.Mock).mockReturnValue(mockIsoDate);
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  describe('onCommand', () => {
    it('should return flight data when flights are available', async () => {
      // Arrange
      const mockFlights: OnlineFlightsApiResponse[] = [
        {
          callsign: 'ROT123',
          name: 'Test Flight 1',
          origin: 'LROP',
          destination: 'LRCL',
          aircraft: 'B738',
          firs: ['LRBB'],
          position: {
            dt: new Date(),
            alt: 30000,
            hdg: 270,
            lat: 45.0,
            lng: 25.0,
            spd: 450,
          },
        },
        {
          callsign: 'ROT456',
          name: 'Test Flight 2',
          origin: 'LRCL',
          destination: 'LROP',
          aircraft: 'A320',
          firs: ['LRBB'],
          position: {
            dt: new Date(),
            alt: 35000,
            hdg: 90,
            lat: 46.0,
            lng: 24.0,
            spd: 480,
          },
        },
        {
          callsign: 'ROT789',
          name: 'Test Flight 3',
          origin: 'EDDF',
          destination: 'LTBA',
          aircraft: 'B777',
          firs: ['EDGG', 'LHCC'], // Not in LRBB FIR
          position: {
            dt: new Date(),
            alt: 38000,
            hdg: 120,
            lat: 50.0,
            lng: 20.0,
            spd: 500,
          },
        },
      ];

      const expectedResponse: InteractionReplyOptions = {
        flags: MessageFlags.Ephemeral,
        embeds: [
          {
            title: 'ONLINE FLIGHTS',
            fields: [
              {
                name: 'ROT123',
                value: 'LROP-LRCL',
                inline: true,
              },
              {
                name: 'ROT456',
                value: 'LRCL-LROP',
                inline: true,
              },
            ],
            timestamp: mockIsoDate,
          },
        ],
      };

      mockRovaccService.getOnlineFlights.mockResolvedValue(mockFlights);

      // Act
      const result = await command.onCommand();

      // Assert
      expect(mockRovaccService.getOnlineFlights).toHaveBeenCalled();
      expect(dateUtils.getISODate).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it('should return no flights message when no flights are available', async () => {
      // Arrange
      const mockFlights: OnlineFlightsApiResponse[] = [];

      const expectedResponse: InteractionReplyOptions = {
        flags: MessageFlags.Ephemeral,
        embeds: [
          {
            title: 'ONLINE FLIGHTS',
            description: undefined,
            fields: [],
            timestamp: mockIsoDate,
          },
        ],
      };

      mockRovaccService.getOnlineFlights.mockResolvedValue(mockFlights);

      // Act
      const result = await command.onCommand();

      // Assert
      expect(mockRovaccService.getOnlineFlights).toHaveBeenCalled();
      expect(dateUtils.getISODate).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it('should filter out flights not in LRBB FIR', async () => {
      // Arrange
      const mockFlights: OnlineFlightsApiResponse[] = [
        {
          callsign: 'ROT789',
          name: 'Test Flight 3',
          origin: 'EDDF',
          destination: 'LTBA',
          aircraft: 'B777',
          firs: ['EDGG', 'LHCC'], // Not in LRBB FIR
          position: {
            dt: new Date(),
            alt: 38000,
            hdg: 120,
            lat: 50.0,
            lng: 20.0,
            spd: 500,
          },
        },
      ];

      const expectedResponse: InteractionReplyOptions = {
        flags: MessageFlags.Ephemeral,
        embeds: [
          {
            title: 'ONLINE FLIGHTS',
            description: undefined,
            fields: [],
            timestamp: mockIsoDate,
          },
        ],
      };

      mockRovaccService.getOnlineFlights.mockResolvedValue(mockFlights);

      // Act
      const result = await command.onCommand();

      // Assert
      expect(mockRovaccService.getOnlineFlights).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it('should propagate errors from the service', async () => {
      // Arrange
      const mockError = new Error('Service error');
      mockRovaccService.getOnlineFlights.mockRejectedValue(mockError);

      // Act & Assert
      await expect(command.onCommand()).rejects.toThrow(mockError);
      expect(mockRovaccService.getOnlineFlights).toHaveBeenCalled();
    });
  });

  describe('prepareResponse', () => {
    it('should properly format and filter flight data', () => {
      // Arrange
      const mockFlights: OnlineFlightsApiResponse[] = [
        {
          callsign: 'ROT123',
          name: 'Test Flight 1',
          origin: 'LROP',
          destination: 'LRCL',
          aircraft: 'B738',
          firs: ['LRBB'],
          position: {
            dt: new Date(),
            alt: 30000,
            hdg: 270,
            lat: 45.0,
            lng: 25.0,
            spd: 450,
          },
        },
        {
          callsign: 'ROT456',
          name: 'Test Flight 2',
          origin: 'LRCL',
          destination: 'LROP',
          aircraft: 'A320',
          firs: ['LRBB'],
          position: {
            dt: new Date(),
            alt: 35000,
            hdg: 90,
            lat: 46.0,
            lng: 24.0,
            spd: 480,
          },
        },
        {
          callsign: 'ROT789',
          name: 'Test Flight 3',
          origin: 'EDDF',
          destination: 'LTBA',
          aircraft: 'B777',
          firs: ['EDGG', 'LHCC'], // Not in LRBB FIR
          position: {
            dt: new Date(),
            alt: 38000,
            hdg: 120,
            lat: 50.0,
            lng: 20.0,
            spd: 500,
          },
        },
      ];

      const expectedFields = [
        {
          name: 'ROT123',
          value: 'LROP-LRCL',
          inline: true,
        },
        {
          name: 'ROT456',
          value: 'LRCL-LROP',
          inline: true,
        },
      ];

      // Act
      const result = command['prepareResponse'](mockFlights);

      // Assert
      expect(result).toEqual(expectedFields);
      expect(result.length).toBe(2);
    });

    it('should return empty array when no flights in LRBB FIR', () => {
      // Arrange
      const mockFlights: OnlineFlightsApiResponse[] = [
        {
          callsign: 'ROT789',
          name: 'Test Flight 3',
          origin: 'EDDF',
          destination: 'LTBA',
          aircraft: 'B777',
          firs: ['EDGG', 'LHCC'], // Not in LRBB FIR
          position: {
            dt: new Date(),
            alt: 38000,
            hdg: 120,
            lat: 50.0,
            lng: 20.0,
            spd: 500,
          },
        },
      ];

      // Act
      const result = command['prepareResponse'](mockFlights);

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });
});