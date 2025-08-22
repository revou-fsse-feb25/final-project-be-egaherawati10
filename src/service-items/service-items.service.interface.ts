import { CreateServiceItemDto } from './dto/create-service-item.dto';
import { UpdateServiceItemDto } from './dto/update-service-item.dto';
import { QueryServiceItemDto } from './dto/query-service-item.dto';
import { ServiceItemResponseDto } from './dto/service-item-response.dto';

export interface IServiceItemsService {
  create(dto: CreateServiceItemDto, actorId: number): Promise<ServiceItemResponseDto>;
  list(q: QueryServiceItemDto): Promise<{ data: ServiceItemResponseDto[]; meta: any }>;
  findById(id: number): Promise<ServiceItemResponseDto>;
  update(id: number, dto: UpdateServiceItemDto, actorId: number): Promise<ServiceItemResponseDto>;
  delete(id: number): Promise<void>;
}

export const SERVICE_ITEMS_SERVICE = Symbol('SERVICE_ITEMS_SERVICE');