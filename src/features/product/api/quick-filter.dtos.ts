export interface QuickFilterValueDto {
  id: number;
  name: string;
}

export interface QuickFilterGroupDto {
  id: number;
  name: string;
  values: QuickFilterValueDto[];
}

export interface QuickFilterResponseDto {
  status?: string;
  data?: QuickFilterGroupDto[];
}
