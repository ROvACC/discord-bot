import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { RovaccService } from './rovacc.service';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';
import {
  FutureBookingsApiResponse,
  OnlineAtcApiResponse,
  OnlineFlightsApiResponse,
  Position,
} from '../types';

describe('RovaccService', () => {
  let service: RovaccService;
  let httpService: HttpService;

  const mockCoreHttpEndpoint = 'https://api.example.com';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RovaccService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockImplementation((key: string) => {
              if (key === 'rovacc.core.host') {
                return mockCoreHttpEndpoint;
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<RovaccService>(RovaccService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getOnlineAtc', () => {
    it('should return online ATC data', async () => {
      // Arrange
      const mockOnlineAtcData: OnlineAtcApiResponse[] = [
        {
          name: 'John Doe',
          frequency: 123.45,
          fir: 'LRBB',
          callsign: 'LRBB_CTR',
        },
      ];

      const mockResponse: AxiosResponse = {
        data: mockOnlineAtcData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: undefined } as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

      // Act
      const result = await service.getOnlineAtc();

      // Assert
      expect(httpService.get).toHaveBeenCalledWith(
        `${mockCoreHttpEndpoint}/vatsim/live-atc`,
      );
      expect(result).toEqual(mockOnlineAtcData);
    });

    it('should throw an error when the HTTP request fails', async () => {
      // Arrange
      const mockError = new Error('Network Error') as AxiosError;
      mockError.response = {
        data: 'Error fetching ATC data',
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: { headers: undefined } as any,
      };

      jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(throwError(() => mockError));

      // Act & Assert
      await expect(service.getOnlineAtc()).rejects.toEqual(
        'An error happened!',
      );
      expect(httpService.get).toHaveBeenCalledWith(
        `${mockCoreHttpEndpoint}/vatsim/live-atc`,
      );
    });
  });

  describe('getOnlineFlights', () => {
    it('should return online flights data', async () => {
      // Arrange
      const mockPosition: Position = {
        dt: new Date(),
        alt: 35000,
        hdg: 270,
        lat: 45.5,
        lng: 25.5,
        spd: 450,
      };

      const mockOnlineFlightsData: OnlineFlightsApiResponse[] = [
        {
          callsign: 'ROT123',
          name: 'Jane Smith',
          origin: 'LROP',
          destination: 'LRCL',
          aircraft: 'B738',
          firs: ['LRBB'],
          position: mockPosition,
        },
      ];

      const mockResponse: AxiosResponse = {
        data: mockOnlineFlightsData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: undefined } as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

      // Act
      const result = await service.getOnlineFlights();

      // Assert
      expect(httpService.get).toHaveBeenCalledWith(
        `${mockCoreHttpEndpoint}/vatsim/live-flights`,
      );
      expect(result).toEqual(mockOnlineFlightsData);
    });

    it('should throw an error when the HTTP request fails', async () => {
      // Arrange
      const mockError = new Error('Network Error') as AxiosError;
      mockError.response = {
        data: 'Error fetching flights data',
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: { headers: undefined } as any,
      };

      jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(throwError(() => mockError));

      // Act & Assert
      await expect(service.getOnlineFlights()).rejects.toEqual(
        'An error happened!',
      );
      expect(httpService.get).toHaveBeenCalledWith(
        `${mockCoreHttpEndpoint}/vatsim/live-flights`,
      );
    });
  });

  describe('getFutureBookings', () => {
    it('should return future bookings data', async () => {
      // Arrange
      const mockFutureBookingsData: FutureBookingsApiResponse[] = [
        {
          callsign: 'LRBB_CTR',
          name: 'John Doe',
          fir: 'LRBB',
          date: '2025-04-21',
          timeStart: '10:00',
          timeStop: '12:00',
        },
      ];

      const mockResponse: AxiosResponse = {
        data: mockFutureBookingsData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: undefined } as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

      // Act
      const result = await service.getFutureBookings();

      // Assert
      expect(httpService.get).toHaveBeenCalledWith(
        `${mockCoreHttpEndpoint}/vatsim/future-bookings`,
      );
      expect(result).toEqual(mockFutureBookingsData);
    });

    it('should throw an error when the HTTP request fails', async () => {
      // Arrange
      const mockError = new Error('Network Error') as AxiosError;
      mockError.response = {
        data: 'Error fetching bookings data',
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        config: { headers: undefined } as any,
      };

      jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(throwError(() => mockError));

      // Act & Assert
      await expect(service.getFutureBookings()).rejects.toEqual(
        'An error happened!',
      );
      expect(httpService.get).toHaveBeenCalledWith(
        `${mockCoreHttpEndpoint}/vatsim/future-bookings`,
      );
    });
  });
});
