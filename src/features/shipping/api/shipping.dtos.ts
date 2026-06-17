export interface ShippingEstimateDto {
  cutoff_time?: string;
  time_left: string;
  dispatch_day?: string;
  dispatch_day_human: string;
  message: string;
  avg_delivery_days?: number;
  estimated_delivery_day?: string;
  estimated_delivery_day_human?: string;
  delivery_message?: string;
  delivery_warning?: {
    show: boolean;
    type: 'deadline' | 'holiday_period';
    title?: string;
    message: string;
    estimated_delivery_day_human?: string;
  } | null;
}
