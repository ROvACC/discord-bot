import { AtcCommand } from './atc.command';
import { RovaccService } from '../services/rovacc.service';
import { InteractionReplyOptions, MessageFlags } from 'discord.js';
import { OnlineAtcApiResponse } from '../types';
import * as dateUtils from '../utils/get-formatted-date';

// Create a mock for the RovaccService
const mockRovaccService = {
  getOnlineAtc: jest.fn(),
};

// Mock the date utility
jest.mock('../utils/get-formatted-date', () => ({
  getISODate: jest.fn(),
}));

describe('AtcCommand', () => {
  let command: AtcCommand;
  const mockIsoDate = '2023-04-20T12:00:00.000Z';

  beforeEach(() => {
    // Create an instance of AtcCommand with the mock RovaccService
    command = new AtcCommand(mockRovaccService as unknown as RovaccService);

    // Clear mock calls between tests
    jest.clearAllMocks();

    // Setup mock date
    (dateUtils.getISODate as jest.Mock).mockReturnValue(mockIsoDate);
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  describe('onCommand', () => {
    it('should return ATC data when controllers are online', async () => {
      // Arrange
      const mockAtcData: OnlineAtcApiResponse[] = [
        {
          callsign: 'LROP_TWR',
          name: 'Bucharest Otopeni Tower',
          frequency: 120.9,
          fir: 'LRBB',
        },
        {
          callsign: 'LRCL_APP',
          name: 'Cluj Approach',
          frequency: 118.25,
          fir: 'LRBB',
        },
      ];

      const expectedResponse: InteractionReplyOptions = {
        flags: MessageFlags.Ephemeral,
        embeds: [
          {
            title: 'ONLINE ATC',
            fields: [
              {
                name: 'LROP_TWR (120.9)',
                value: 'Bucharest Otopeni Tower',
              },
              {
                name: 'LRCL_APP (118.25)',
                value: 'Cluj Approach',
              },
            ],
            timestamp: mockIsoDate,
          },
        ],
      };

      mockRovaccService.getOnlineAtc.mockResolvedValue(mockAtcData);

      // Act
      const result = await command.onCommand();

      // Assert
      expect(mockRovaccService.getOnlineAtc).toHaveBeenCalled();
      expect(dateUtils.getISODate).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it('should return no ATC message when no controllers are online', async () => {
      // Arrange
      const mockAtcData: OnlineAtcApiResponse[] = [];

      const expectedResponse: InteractionReplyOptions = {
        flags: MessageFlags.Ephemeral,
        embeds: [
          {
            title: 'ONLINE ATC',
            description: undefined,
            fields: [],
            timestamp: mockIsoDate,
          },
        ],
      };

      mockRovaccService.getOnlineAtc.mockResolvedValue(mockAtcData);

      // Act
      const result = await command.onCommand();

      // Assert
      expect(mockRovaccService.getOnlineAtc).toHaveBeenCalled();
      expect(dateUtils.getISODate).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });

    it('should propagate errors from the service', async () => {
      // Arrange
      const mockError = new Error('Service error');
      mockRovaccService.getOnlineAtc.mockRejectedValue(mockError);

      // Act & Assert
      await expect(command.onCommand()).rejects.toThrow(mockError);
      expect(mockRovaccService.getOnlineAtc).toHaveBeenCalled();
    });
  });

  describe('prepareResponse', () => {
    it('should properly format ATC data', () => {
      // Arrange
      const mockAtcData: OnlineAtcApiResponse[] = [
        {
          callsign: 'LROP_TWR',
          name: 'Bucharest Otopeni Tower',
          frequency: 120.9,
          fir: 'LRBB',
        },
        {
          callsign: 'LRCL_APP',
          name: 'Cluj Approach',
          frequency: 118.25,
          fir: 'LRBB',
        },
      ];

      const expectedFields = [
        {
          name: 'LROP_TWR (120.9)',
          value: 'Bucharest Otopeni Tower',
        },
        {
          name: 'LRCL_APP (118.25)',
          value: 'Cluj Approach',
        },
      ];

      // Act
      const result = command['prepareResponse'](mockAtcData);

      // Assert
      expect(result).toEqual(expectedFields);
      expect(result.length).toBe(2);
    });

    it('should return empty array when no ATC available', () => {
      // Arrange
      const mockAtcData: OnlineAtcApiResponse[] = [];

      // Act
      const result = command['prepareResponse'](mockAtcData);

      // Assert
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });
  });
});
