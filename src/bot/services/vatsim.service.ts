import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class VatsimService {
  private readonly logger = new Logger(VatsimService.name);

  constructor(private http: HttpService) {}

  async getMetar(icao: string): Promise<string> {
    const { data } = await firstValueFrom(
      this.http
        .get<string>(`https://metar.vatsim.net/metar.php?id=${icao}`)
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
