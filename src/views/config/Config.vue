<template>
  <div class="p-4">
    <template>
      <v-card>
        <v-toolbar
          flat
          color="primary"
          dark
        >
          <v-toolbar-title>Configuración global</v-toolbar-title>
        </v-toolbar>
        <v-tabs vertical>
          <v-tab
            v-for="config in configList"
            :key="config"
          >
            {{ config }}
          </v-tab>

          <!-- ORDEN GENERACION DE TABLAS -->
          <v-tab-item v-if="showConfig('Orden generación de tablas')">
            <v-card flat class="p-4 shadow-inner">
              <div
                v-for="table in config"
                :key="table.id"
                class="my-4 h-13"
              >
                <div class="inline-flex items-center w-48 px-2 py-1 mb-2 font-medium text-white bg-blue-400 rounded shadow-md">
                  {{ table.table }}
                </div>
                <div class="flex flex-grow-0 max-w-screen-sm">
                  <v-select
                    style="width: 250px"
                    v-model="table.column"
                    :items="columns"
                    label="Columna"
                    height="30px"
                  />
                  <v-switch
                    class="mx-4"
                    v-model="table.ascendant"
                    label="ASC"
                  />
                </div>
              </div>

              <div class="my-2 text-right">
                <v-btn
                  @click="saveTableConfig"
                  color="primary mx-8 my-4"
                >
                  Guardar
                </v-btn>
              </div>
            </v-card>
          </v-tab-item>

          <!-- LISTA DE CONTEOS -->
          <v-tab-item v-if="showConfig('Conteo de productos')">
            <div class="p-4">
              <v-text-field
                v-model.number="consecutiveCountingNumber"
                label="Inicio del consecutivo"
              />

              <v-btn
                @click="generatePdf"
                color="primary"
                class="mb-2"
              >
                Generar lista de conteos
              </v-btn>
            </div>
          </v-tab-item>

          <v-tab-item>
            <ConfigRoutes />
          </v-tab-item>
        </v-tabs>
      </v-card>
    </template>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

import { InventoryConfigApi } from '@/api';
import { MessageTypes } from '@/instance/global-messaging';
import { InventoryCount } from '@/model/inventory-count/inventory-count';
import { getTokenData } from '@/model/user/get-token-data';
import { UserRoles } from '@/model/user/user-rol.enum';
import ConfigRoutes from '@/views/config/ConfigRoutes.vue';
import { AccessControl } from '@/access-control/access-control';
import { Enterprise } from '@/model/enterprise/enterprise.enum';

const CONFIG_LIST = [
  'Orden generación de tablas',
  'Conteo de productos',
  'Rutas de acceso',
];

@Component({
  name: 'Config',
  components: {
    ConfigRoutes,
  },
})
export default class Config extends Vue {
  public columns: string[] = [];
  public config: any[] = [];
  public consecutiveCountingNumber = 0;

  public configList: string[] = []

  beforeMount() {
    this.configList = AccessControl.omitFeatures<string>(
      CONFIG_LIST,
      {},
      {
        [Enterprise.UNIPARTES]: [
          'Orden generación de tablas',
        ],
      },
    );
  }

  async mounted() {
    const res = await this.$useLoader(InventoryConfigApi.getConfig());

    this.columns = res.columns;
    this.config = res.config.sort((a, b) => a.table.localeCompare(b.table));
  }

  async saveTableConfig() {
    const updates: Promise<any>[] = [];

    this.config.forEach((config) => {
      updates.push(InventoryConfigApi.saveConfig({ ...config }));
    });

    await this.$useLoader(Promise.all(updates));
    this.$report({
      title: 'Configuraciones actualizadas',
      type: MessageTypes.SUCCESS,
    });
  }

  async generatePdf() {
    this.$useLoader(InventoryCount.generateImage(this.consecutiveCountingNumber));
  }

  showConfig(section: string): boolean {
    return this.configList.includes(section);
  }
}
</script>
