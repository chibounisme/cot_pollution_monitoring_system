import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StationsService } from 'src/app/services/stations.service';

@Component({
  selector: 'app-station-dashboard',
  templateUrl: './station-dashboard.component.html',
  styleUrls: ['./station-dashboard.component.scss'],
})
export class StationDashboardComponent implements OnInit {
  station: {
    station_name: 'test'
  };
  stationId: any;

  constructor(private route: ActivatedRoute, private stationsService: StationsService) {
    this.stationId = this.route.snapshot.params['stationId'];
    console.log(this.stationId);
    this.stationsService.getStationByStationId(this.stationId).subscribe(data => {
      console.log(data);
      this.station = data;
    });
  }

  ngOnInit() { 
  }

}
