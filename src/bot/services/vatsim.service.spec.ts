import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { VatsimService } from './vatsim.service';
import { of, throwError } from 'rxjs';
import { AxiosError, AxiosResponse } from 'axios';

describe('VatsimService', () => {
  let service: VatsimService;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VatsimService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<VatsimService>(VatsimService);
    httpService = module.get<HttpService>(HttpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getMetar', () => {
    it('should return METAR data for a valid ICAO code', async () => {
      // Arrange
      const mockIcao = 'LROP';
      const mockMetarData =
        'LROP 201030Z 27006KT 240V310 9999 FEW040 SCT100 19/08 Q1017 NOSIG';

      const mockResponse: AxiosResponse = {
        data: mockMetarData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: undefined } as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

      // Act
      const result = await service.getMetar(mockIcao);

      // Assert
      expect(httpService.get).toHaveBeenCalledWith(
        `https://metar.vatsim.net/metar.php?id=${mockIcao}`,
      );
      expect(result).toEqual(mockMetarData);
    });

    it('should throw an error when the HTTP request fails', async () => {
      // Arrange
      const mockIcao = 'INVALID';
      const mockError = new Error('Network Error') as AxiosError;
      mockError.response = {
        data: 'Error fetching METAR data',
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config: { headers: undefined } as any,
      };

      jest
        .spyOn(httpService, 'get')
        .mockReturnValueOnce(throwError(() => mockError));

      // Act & Assert
      await expect(service.getMetar(mockIcao)).rejects.toEqual(
        'An error happened!',
      );
      expect(httpService.get).toHaveBeenCalledWith(
        `https://metar.vatsim.net/metar.php?id=${mockIcao}`,
      );
    });

    it('should handle empty METAR responses', async () => {
      // Arrange
      const mockIcao = 'XXXX'; // Non-existent ICAO
      const mockMetarData = 'No METAR available for XXXX';

      const mockResponse: AxiosResponse = {
        data: mockMetarData,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: { headers: undefined } as any,
      };

      jest.spyOn(httpService, 'get').mockReturnValueOnce(of(mockResponse));

      // Act
      const result = await service.getMetar(mockIcao);

      // Assert
      expect(httpService.get).toHaveBeenCalledWith(
        `https://metar.vatsim.net/metar.php?id=${mockIcao}`,
      );
      expect(result).toEqual(mockMetarData);
    });
  });
});
