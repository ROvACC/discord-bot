import { MetarCommand, MetarDto } from './metar.command';
import { VatsimService } from '../services/vatsim.service';
import { InteractionReplyOptions, MessageFlags } from 'discord.js';

// Create a mock for the VatsimService
const mockVatsimService = {
  getMetar: jest.fn(),
};

describe('MetarCommand', () => {
  let command: MetarCommand;

  beforeEach(() => {
    // Create an instance of MetarCommand with the mock VatsimService
    command = new MetarCommand(mockVatsimService as unknown as VatsimService);

    // Clear mock calls between tests
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  describe('onCommand', () => {
    // Helper method to directly call the handler method bypassing decorators
    async function callOnCommand(
      icao: string,
    ): Promise<InteractionReplyOptions> {
      // Create a DTO to pass to the handler
      const dto = new MetarDto();
      dto.icao = icao;

      // Call the handler method directly
      return command['onCommand'](dto);
    }

    it('should return METAR data for a valid ICAO code', async () => {
      // Arrange
      const mockIcao = 'LROP';
      const mockMetarData =
        'LROP 201030Z 27006KT 240V310 9999 FEW040 SCT100 19/08 Q1017 NOSIG';

      const expectedResponse: InteractionReplyOptions = {
        flags: MessageFlags.Ephemeral,
        embeds: [
          {
            title: `METAR FOR ${mockIcao}`,
            description: mockMetarData,
          },
        ],
      };

      mockVatsimService.getMetar.mockResolvedValue(mockMetarData);

      // Act
      const result = await callOnCommand(mockIcao);

      // Assert
      expect(mockVatsimService.getMetar).toHaveBeenCalledWith(mockIcao);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle empty or error METAR responses', async () => {
      // Arrange
      const mockIcao = 'XXXX'; // Non-existent ICAO
      const mockMetarData = 'No METAR available for XXXX';

      const expectedResponse: InteractionReplyOptions = {
        flags: MessageFlags.Ephemeral,
        embeds: [
          {
            title: `METAR FOR ${mockIcao}`,
            description: mockMetarData,
          },
        ],
      };

      mockVatsimService.getMetar.mockResolvedValue(mockMetarData);

      // Act
      const result = await callOnCommand(mockIcao);

      // Assert
      expect(mockVatsimService.getMetar).toHaveBeenCalledWith(mockIcao);
      expect(result).toEqual(expectedResponse);
    });

    it('should propagate errors from the service', async () => {
      // Arrange
      const mockIcao = 'LROP';
      const mockError = new Error('Service error');

      mockVatsimService.getMetar.mockRejectedValue(mockError);

      // Act & Assert
      await expect(callOnCommand(mockIcao)).rejects.toThrow(mockError);
      expect(mockVatsimService.getMetar).toHaveBeenCalledWith(mockIcao);
    });
  });
});
