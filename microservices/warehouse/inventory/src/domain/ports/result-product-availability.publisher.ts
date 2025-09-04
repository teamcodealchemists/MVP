export interface ResultProductAvailabilityPublisher {
  insufficientProductAvailability(): Promise<void>;
  sufficientProductAvailability(): Promise<void>;
}