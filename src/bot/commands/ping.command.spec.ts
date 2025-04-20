import { PingCommand } from './ping.command';
import { InteractionReplyOptions, MessageFlags } from 'discord.js';

describe('PingCommand', () => {
  let command: PingCommand;

  beforeEach(() => {
    // Create an instance of PingCommand directly
    command = new PingCommand();
  });

  it('should be defined', () => {
    expect(command).toBeDefined();
  });

  describe('onCommand', () => {
    it('should return the correct response', () => {
      // Arrange
      const expectedResponse: InteractionReplyOptions = {
        flags: MessageFlags.Ephemeral,
        content: 'Pong!',
      };

      // Act
      const result = command.onCommand();

      // Assert
      expect(result).toEqual(expectedResponse);
    });

    it('should return an ephemeral message', () => {
      // Act
      const result = command.onCommand();

      // Assert
      expect(result.flags).toBe(MessageFlags.Ephemeral);
    });

    it('should return the correct content', () => {
      // Act
      const result = command.onCommand();

      // Assert
      expect(result.content).toBe('Pong!');
    });
  });
});
