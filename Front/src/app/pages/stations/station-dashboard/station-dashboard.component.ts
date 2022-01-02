import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StationsService } from 'src/app/services/stations.service';
import * as Leaflet from 'leaflet';
import { antPath } from 'leaflet-ant-path';

@Component({
  selector: 'app-station-dashboard',
  templateUrl: './station-dashboard.component.html',
  styleUrls: ['./station-dashboard.component.scss'],
})
export class StationDashboardComponent implements OnInit, OnDestroy {
  station: any;
  loadedData: boolean;
  stationId: any;
  map: Leaflet.Map;

  ionViewDidEnter() { this.leafletMap(); }

  leafletMap() {
    this.map = Leaflet.map('mapId').setView([28.644800, 77.216721], 5);
    Leaflet.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: 'edupala.com',
    }).addTo(this.map);

    const markPoint = Leaflet.marker([28.644800, 77.594563], {
      icon: Leaflet.icon({
        iconUrl: 'assets/marker-icon-2x.png',
        shadowUrl: 'assets/marker-shadow.png',
        iconSize: [38, 95], // size of the icon
        shadowSize: [50, 64], // size of the shadow
        iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [18, 62],  // the same for the shadow
        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
      })
    });
    markPoint.bindPopup('<p>Tashi Delek - Bangalore.</p>');
    this.map.addLayer(markPoint);
  }

  constructor(private route: ActivatedRoute, private stationsService: StationsService) {
    this.loadedData = false;
    this.stationId = this.route.snapshot.params['stationId'];
  }

  ngOnInit() {
    this.stationsService.getStationByStationId(this.stationId).subscribe(data => {
      this.loadedData = true;
      this.station = data[0];
      console.log(this.station);
    });
  }

  ngOnDestroy() {
    this.map.remove();
  }

  doRefresh(event) {
    console.log('Begin async operation');

    setTimeout(() => {
      console.log('Async operation has ended');
      event.target.complete();
    }, 2000);
  }
}
