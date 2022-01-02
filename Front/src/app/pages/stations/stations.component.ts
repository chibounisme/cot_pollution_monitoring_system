import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { ToastController } from '@ionic/angular';
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
  updateToast: HTMLIonToastElement;

  stations: any[];

  constructor(public stationService: StationsService, public authService: AuthService,
    public toastController: ToastController, public router: Router) {
    this.isAddStationModalOpen = false;
    this.isScanning = false;
    if (Capacitor.isNativePlatform()) {
      BarcodeScanner.stopScan();
      BarcodeScanner.prepare();
    }
  }

  async ngOnInit() {
    this.stationService.getUserStations().subscribe(data => {
      this.stations = data;
    });
    if (Capacitor.isNativePlatform()) {
      await BarcodeScanner.checkPermission({ force: true });
    }
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
    await BarcodeScanner.hideBackground();
    const result = await BarcodeScanner.startScan();
    this.isScanning = false;
    if (result.hasContent) {
      await BarcodeScanner.showBackground();

      const stationId = JSON.parse(result.content).station_id;
      const stationName = JSON.parse(result.content).station_name;
      // get the coordinates
      const coordinates = await Geolocation.getCurrentPosition();

      // check if station is Added 
      this.stationService.connectToStation(stationId, stationName, coordinates.coords.latitude, coordinates.coords.longitude)
        .subscribe(async data => {
          this.isAddStationModalOpen = false;

          this.stationService.getUserStations().subscribe(async data => {
            this.stations = data;
            this.updateToast = await this.toastController.create({
              duration: 2500,
              message: 'Connected to station successfully!',
              color: 'success'
            });
            await this.updateToast.present();
          });
        }, async err => {
          this.updateToast = await this.toastController.create({
            duration: 2500,
            message: 'The station has been already added to an account!',
            color: 'danger'
          });

          await this.updateToast.present();
        });
    }
  };

  async enableStation(stationId) {
    this.updateToast = await this.toastController.create({
      duration: 2500,
      message: 'Enabled station successfully!',
      color: 'success'
    });

    await this.updateToast.dismiss();
    this.stationService.enableUserStation(stationId).subscribe(_ => {
      this.stationService.getUserStations().subscribe(async data => {
        this.stations = data;
        await this.updateToast.present();
      });
    });
  }

  async disableStation(stationId) {
    this.updateToast = await this.toastController.create({
      duration: 2500,
      message: 'Disabled station successfully!',
      color: 'success'
    });

    this.stationService.disableUserStation(stationId).subscribe(_ => {
      this.stationService.getUserStations().subscribe(async data => {
        this.stations = data;
        await this.updateToast.present();
      });
    });
  }

  goToStationDetails(stationId) {
    this.router.navigate(['stations', stationId]);
  }

  isNativePlatform() {
    return Capacitor.isNativePlatform();
  }
}
