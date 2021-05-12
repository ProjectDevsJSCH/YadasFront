import { RouteDTO } from './route.dto';

export class Route extends RouteDTO {
  constructor(dto: RouteDTO) {
    super();
    Object.assign(this, dto);
  }
}
