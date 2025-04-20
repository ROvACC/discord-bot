import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import {
  FutureBookingsApiResponse,
  OnlineAtcApiResponse,
  OnlineFlightsApiResponse,
} from '../types';

@Injectable()
export class RovaccService {
  private readonly logger = new Logger(RovaccService.name);
  private coreHttpEndpoint = this.configService.get<string>('rovacc.core.host');

  constructor(
    private configService: ConfigService,
    private httpService: HttpService,
  ) {}

  async getOnlineAtc(): Promise<OnlineAtcApiResponse[]> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<OnlineAtcApiResponse[]>(`${this.coreHttpEndpoint}/vatsim/live-atc`)
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );
    return data;
  }

  async getOnlineFlights(): Promise<OnlineFlightsApiResponse[]> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<
          OnlineFlightsApiResponse[]
        >(`${this.coreHttpEndpoint}/vatsim/live-flights`)
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );
    return data;
  }

  async getFutureBookings(): Promise<FutureBookingsApiResponse[]> {
    const { data } = await firstValueFrom(
      this.httpService
        .get<
          FutureBookingsApiResponse[]
        >(`${this.coreHttpEndpoint}/vatsim/future-bookings`)
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.response.data);
            throw 'An error happened!';
          }),
        ),
    );
    return data;
  }
}
