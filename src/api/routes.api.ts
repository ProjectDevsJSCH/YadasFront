import axios from '@/config/http-common';
import { RouteDTO } from '@/model/routes/route.dto';
import { Route } from '@/model/routes/route.model';

export abstract class RoutesApi {
  static async getAllRoutes(searchParams = '') {
    const { data }: { data: RouteDTO[]; } = await axios.get(`/routes?${searchParams}`);

    return data.map((route) => new Route(route));
  }

  static async patchRoute(id: number, body: any) {
    const { data } = await axios.patch(`/routes/${id}`, body);
  }
}
