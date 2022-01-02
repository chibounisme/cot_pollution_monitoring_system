import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Geolocation } from '@capacitor/geolocation';
import { AuthService } from 'src/app/services/auth.service';
import { StationsService } from 'src/app/stations.service';

@Component({
  selector: 'app-stations',
  templateUrl: './stations.component.html',
  styleUrls: ['./stations.component.scss'],
})
export class StationsComponent implements OnInit {
  isAddStationModalOpen: boolean;
  isScanning: boolean;

  stations: [];

  constructor(public stationService: StationsService, public authService: AuthService) {
    this.isAddStationModalOpen = false;
    this.isScanning = false;
    BarcodeScanner.stopScan();
    BarcodeScanner.prepare();
  }

  ngOnInit() { }

  openStationModal() {
    this.isAddStationModalOpen = false;
    this.isAddStationModalOpen = true;
  }

  closeStationModal() {
    this.isAddStationModalOpen = false;
  }
  
  scanQRCode() {
    this.startScan();
  }
  
  async startScan() {
    this.isScanning = true;
    await BarcodeScanner.checkPermission({ force: true });
    await BarcodeScanner.hideBackground();
    const result = await BarcodeScanner.startScan();
    if (result.hasContent) {
      this.isAddStationModalOpen = false;
      const stationId = JSON.parse(result.content).station_id;
      // get the coordinates
      const coordinates = await Geolocation.getCurrentPosition();
      alert(`${stationId} -- ${JSON.stringify(coordinates.coords)}`)
      // check if station is Added 

    }
    this.isScanning = false;
  };
}
