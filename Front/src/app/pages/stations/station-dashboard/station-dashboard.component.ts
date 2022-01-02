import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StationsService } from 'src/app/services/stations.service';
import * as Leaflet from 'leaflet';
import { ToastController } from '@ionic/angular';

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
  updateToast: HTMLIonToastElement;

  ionViewDidEnter() { this.leafletMap(); }

  leafletMap() {
    this.map = Leaflet.map('detailsMap').setView([this.station.station_lat, this.station.station_long], 12);
    Leaflet.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: 'edupala.com',
    }).addTo(this.map);

    const markPoint = Leaflet.marker([this.station.station_lat, this.station.station_long], {
      icon: Leaflet.icon({
        iconUrl: 'assets/marker-icon-2x.png',
        shadowUrl: 'assets/marker-shadow.png',
        iconSize: [30, 80], // size of the icon
        shadowSize: [40, 50], // size of the shadow
        iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
        shadowAnchor: [18, 62],  // the same for the shadow
        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
      })
    });
    this.map.addLayer(markPoint);
  }

  constructor(private route: ActivatedRoute, private stationsService: StationsService,
    public toastController: ToastController) {
    this.loadedData = false;
    this.stationId = this.route.snapshot.params['stationId'];
  }

  ngOnInit() {
    console.log(this.stationId);
    this.stationsService.getStationByStationId(this.stationId).subscribe(data => {
      this.loadedData = true;
      this.station = data;
      console.log(JSON.stringify(this.station));
    });
  }

  ngOnDestroy() {
    this.map.remove();
  }

  doRefresh(event) {
    console.log('Begin async operation');
    this.stationsService.getStationByStationId(this.stationId).subscribe(async data => {
      this.loadedData = true;
      this.station = data;

      this.updateToast = await this.toastController.create({
        duration: 2500,
        message: 'Updated!',
        color: 'success',
        animated: true,
        position: 'top'
      });
      await this.updateToast.present();
      event.target.complete();
    });
  }
}
