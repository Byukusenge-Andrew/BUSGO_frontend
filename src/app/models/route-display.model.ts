/**
 * Interface representing a route for display in the UI
 * This model is used for displaying route information in tables and cards
 */
export interface RouteDisplay {
  /**
   * Unique identifier for the route
   */
  id: string;

  /**
   * Display name of the route (typically origin - destination)
   */
  name: string;

  /**
   * Starting point of the route
   */
  origin: string;

  /**
   * End point of the route
   */
  destination: string;

  /**
   * Total distance of the route in kilometers
   */
  distance: number;

  /**
   * Duration of the route in hours
   */
  duration: number;

  /**
   * Base price for the route
   */
  price: number;

  /**
   * Current status of the route (ACTIVE or INACTIVE)
   */
  status: string;

  /**
   * Number of schedules associated with this route
   */
  scheduleCount: number;

  /**
   * Date when the route was last updated
   */
  lastUpdated: Date;
}
