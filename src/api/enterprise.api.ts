import axios from '@/config/http-common';

import { EnterpriseDTO } from '@/model/enterprise/enterprise.dto';
import { Enterprise } from '@/model/enterprise/enterprise.model';

export abstract class EnterprisesApi {
  static async getAll() {
    const { data }: { data: EnterpriseDTO[]; } = await axios.get('/enterprise');

    return data.map((enterprise) => new Enterprise(enterprise));
  }
}
