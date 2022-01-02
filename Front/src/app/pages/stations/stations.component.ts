import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { AuthService } from 'src/app/services/auth.service';
import { StationsService } from 'src/app/services/stations.service';

@Component({
  selector: 'app-stations',
  templateUrl: './stations.component.html',
  styleUrls: ['./stations.component.scss'],
})
export class StationsComponent implements OnInit {
  isAddStationModalOpen: boolean;
  isScanning: boolean;
  isConnectToStationError: boolean;

  stations: any[];

  constructor(public stationService: StationsService, public authService: AuthService) {
    this.isAddStationModalOpen = false;
    this.isConnectToStationError = false;
    this.isScanning = false;
    if (Capacitor.isNativePlatform()) {
      BarcodeScanner.stopScan();
      BarcodeScanner.prepare();
    }
  }

  ngOnInit() {
    this.stationService.getUserStations().subscribe(data => {
      this.stations = data;
      console.log(data);
    });
  }

  openStationModal() {
    this.isAddStationModalOpen = false;
    this.isAddStationModalOpen = true;
  }

  closeStationModal() {
    this.isAddStationModalOpen = false;
  }

  scanQRCode() {
    if (Capacitor.isNativePlatform()) {
      this.startScan();
    }
  }

  async startScan() {
    this.isScanning = true;
    this.isConnectToStationError = false;
    await BarcodeScanner.checkPermission({ force: true });
    await BarcodeScanner.hideBackground();
    const result = await BarcodeScanner.startScan();
    if (result.hasContent) {
      this.isAddStationModalOpen = false;
      const stationId = JSON.parse(result.content).station_id;
      const stationName = JSON.parse(result.content).station_name;
      // get the coordinates
      const coordinates = await Geolocation.getCurrentPosition();
      
      // check if station is Added 
      this.stationService.connectToStation(stationId, stationName, coordinates.coords.latitude, coordinates.coords.longitude)
        .subscribe(data => {
          this.isScanning = false;
        }, err => {
          this.isScanning = false;
          this.isConnectToStationError = true;
          alert(JSON.stringify(err));
        });
    }
  };

  enableStation(stationId) {
    console.log(stationId);
    this.stationService.enableUserStation(stationId).subscribe(_ => {
      this.stationService.getUserStations().subscribe(data => {
        this.stations = data;
      });
    }, err => {
      alert(JSON.stringify(err));
    });
  }
  
  disableStation(stationId) {
    console.log(stationId);
    this.stationService.disableUserStation(stationId).subscribe(_ => {
      this.stationService.getUserStations().subscribe(data => {
        this.stations = data;
      });
    }, err => {
      alert(JSON.stringify(err));
    });
  }
}
