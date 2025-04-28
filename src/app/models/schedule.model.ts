import {BusLocation} from '../services/bus-location.service';

export interface Schedule {
  id: number;
  routeName: string;
  departureTime: Date;
  arrivalTime: Date;
  busNumber: string;
  availableSeats: number;
  totalSeats: number;
  price: number; // Maps to fare
  status: string; // Maps to active (SCHEDULED or CANCELLED)
  busType: string;
  companyId: number;
  routeId: number;
  sourceLocation: BusLocation;
  destinationLocation: BusLocation;
}
