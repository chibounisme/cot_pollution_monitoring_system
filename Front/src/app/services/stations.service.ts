import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StationsService {

  backendUrl: string = environment.backendUrl;

  constructor(private http: HttpClient) { }

  public getUserStations() {
    return this.http.get<any>(`${this.backendUrl}/stations`);
  }
  
  public getStationByStationId(stationId) {
    return this.http.get<any>(`${this.backendUrl}/stations/${stationId}`);
  }

  public connectToStation(stationId, stationName, stationLat, stationLong) {
    return this.http.post<any>(`${this.backendUrl}/stations`, {
      stationId, stationName, stationLat, stationLong
    });
  }

  public enableUserStation(stationId: string) {
    return this.http.get<any>(`${this.backendUrl}/stations/${stationId}/enable`);
  }

  public disableUserStation(stationId: string) {
    return this.http.get<any>(`${this.backendUrl}/stations/${stationId}/disable`);
  }
}
