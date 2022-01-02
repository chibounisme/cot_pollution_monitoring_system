import { Component, OnDestroy, OnInit } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { StationsService } from 'src/app/services/stations.service';
import * as Leaflet from 'leaflet';
import 'leaflet-routing-machine';

@Component({
  selector: 'app-find-path',
  templateUrl: './find-path.component.html',
  styleUrls: ['./find-path.component.scss'],
})
export class FindPathComponent implements OnInit, OnDestroy {
  map: Leaflet.Map;
  stations: any[] = [];

  ionViewDidEnter() { this.leafletMap(); }

  leafletMap() {
    this.map = Leaflet.map('findPathMap');
    Leaflet.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: 'edupala.com',
    }).addTo(this.map);

    this.stationsService.getUserStations().subscribe(data => {
      this.stations = data;
    
      let waypoints = this.stations.filter(value => value.isEnabled).map(value => Leaflet.latLng(value.station_lat, value.station_long));
      Geolocation.getCurrentPosition().then(userCoords => {
        waypoints = [Leaflet.latLng(userCoords.coords.latitude, userCoords.coords.longitude), ...waypoints];
        console.log(waypoints);
        Leaflet.Routing.control({
          waypoints: waypoints,
        }).addTo(this.map);    
      });
    });

  }


  constructor(private stationsService: StationsService) {
    
  }

  ngOnInit() { }

  ngOnDestroy() {
    this.map.remove();
  }

}
