import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StationsService {

  backendUrl: string = environment.backendUrl;

  constructor(private storage: Storage, private http: HttpClient) { }

  getUserStations(userId: string) {
    return this.http.get<any>(`${this.backendUrl}/users/${userId}/stations`);
  }
}
