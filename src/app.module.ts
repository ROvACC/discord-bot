import { DiscordModule } from '@discord-nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { DiscordConfigService } from './services/discord-config.service';
import { HealthCheckController } from './controllers/healthcheck.controller';
import { TerminusModule } from '@nestjs/terminus';
import { BotModule } from './bot/bot.module';
import { BotSlashCommandsModule } from './bot/bot-slash-commands.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
      isGlobal: true,
      load: [configuration],
    }),
    DiscordModule.forRootAsync({
      useClass: DiscordConfigService,
    }),
    TerminusModule,
    BotModule,
    BotSlashCommandsModule,
  ],
  controllers: [HealthCheckController],
})
export class AppModule {}
