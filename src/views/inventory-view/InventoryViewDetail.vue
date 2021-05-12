<template>
  <div class="p-4 bg-white">
    <div class="mb-4 cs-header">
      {{ inventoryMovement.referencia }}
    </div>

    <div class="flex justify-around">
      <!-- DETAILS -->
      <div>
        <!-- Details -->
        <div class="flex flex-col justify-around">
          <div class="flex">
            <v-btn icon>
              <v-icon>mdi-calendar-range</v-icon>
            </v-btn>

            <v-chip class="ma-2" color="primary" label outlined>
              {{ dateRange[0].date }}
            </v-chip>

            <v-chip class="ma-2" color="primary" label outlined>
              {{ dateRange[1].date }}
            </v-chip>
          </div>

          <div>
            <v-btn icon>
              <v-icon>mdi-database</v-icon>
            </v-btn>

            <b>Inventario actual:</b>
            <span
              :class="{ 'text-red-500': inventoryMovement.inventario <= 0 }"
            >
              {{ inventoryMovement.inventario }}
            </span>
          </div>

          <div class="flex flex-col items-center justify-center">
            <div class="mb-2 text-center">
              <b>Año seleccionado</b>
            </div>
            <v-select
              class="w-40"
              :items="yearOptions"
              dense
              outlined
              v-model="selectedYear"
            />
          </div>
        </div>

        <!-- Movements -->
        <div class="flex items-center justify-center">
          <div class="flex-shrink-0 mx-2 mb-4">
            <div class="text-center">
              <b>Entradas | Salidas</b>
            </div>
            <v-chip class="ma-2" outlined label color="primary">
              {{ totalBalance.in | noData }} - {{ totalBalance.out | noData }}
            </v-chip>
          </div>

          <div class="mx-2 mt-8 w-52">
            <v-select
              class="w-40"
              :items="availableMonths"
              label="Mes"
              dense
              outlined
              v-model="selectedMonth"
            />
          </div>
        </div>

        <!-- TABLE -->
        <v-simple-table fixed-header height="300px" dense>
          <template v-slot:default>
            <thead>
              <tr>
                <th class="text-left">Día</th>
                <th class="text-left">Entradas</th>
                <th class="text-left">Salidas</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="day in currentMonth" :key="day.day">
                <td>{{ day.day }}</td>
                <td>{{ day.incomming === 0 ? '-' : day.incomming }}</td>
                <td>{{ day.outcomming === 0 ? '-' : day.outcomming }}</td>
              </tr>
            </tbody>
          </template>
        </v-simple-table>
      </div>

      <!-- GRAPH -->
      <div class="chart-container">
        <div id="chartContainer" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Vue, Component, Prop, Watch,
} from 'vue-property-decorator';

import moment from 'moment';
import { capitalize } from 'lodash';
import Highcharts from 'highcharts/highstock.src';

import {
  InventoryMovement,
  InventoryMovementDetail,
} from '@/model/inventory-movement/inventory-movement.dto';
import { InventoryApi } from '@/api';

@Component({})
export default class Layout extends Vue {
  @Prop()
  public inventoryMovement!: InventoryMovement;
  @Prop()
  public dateRange!: any[];
  public barType = [
    { text: 'Líneas', value: 'line' },
    { text: 'Barras', value: 'bar' },
  ];
  public yearMovements: InventoryMovementDetail = {} as any;
  public yearOptions: { value: number; text: number }[] = [];
  public selectedYear = -1;
  public selectedMonth = -1;
  public monthsList: { value: number; text: string }[] = [];

  get currentMonth() {
    if (this.selectedMonth === -1) {
      return [];
    }

    return this.yearMovements.yearsMovement[this.selectedYear].monthsMovement
      .find((month) => month.month === this.selectedMonth)
      ?.daysMovement.sort((a, b) => a.day - b.day);
  }

  get availableMonths() {
    if (this.selectedYear === -1) {
      return [];
    }

    return this.monthsList.filter((month) => this.yearMovements
      .yearsMovement[this.selectedYear].monthsMovement.some(
        (innerMonth) => innerMonth.month === month.value,
      ));
  }

  get totalBalance() {
    if (this.selectedYear === -1) {
      return {
        in: '',
        out: '',
      };
    }

    return {
      in:
        this.yearMovements?.yearsMovement[
          this.selectedYear
        ].monthsMovement.find((month) => month.month === this.selectedMonth)
          ?.incomming ?? '',
      out:
        this.yearMovements?.yearsMovement[
          this.selectedYear
        ].monthsMovement.find((month) => month.month === this.selectedMonth)
          ?.outcomming ?? '',
    };
  }

  async mounted() {
    this.monthsList = moment()
      .localeData()
      .months()
      .map((month, index) => ({ value: index, text: capitalize(month) }));
  }

  @Watch('inventoryMovement', { deep: true, immediate: true })
  async onInventoryChange() {
    const detail = await this.$useLoader(
      InventoryApi.getInventoryMovementDetail(this.inventoryMovement.id, {
        fechaInicio: `${this.dateRange[0].date}-01`,
        fechaFinal: moment(`${this.dateRange[1].date}-28`).endOf('month').format('YYYY-MM-DD'),
      }),
    );

    this.$nextTick(() => {
      this.selectedMonth = -1;
      this.yearMovements = detail;
      this.yearOptions = this.yearMovements.yearsMovement.map(
        (year, index) => ({ value: index, text: year.year }),
      );
      this.selectedYear = this.yearOptions.length - 1;
      this.setupChart(detail);
    });
  }

  private setupChart(data: InventoryMovementDetail) {
    const daysData = data.yearsMovement.map((year) => year.monthsMovement
      .flatMap((month) => month.daysMovement.map((day) => {
        const [a, b] = [
          moment(`${year.year}-${month.month + 1}-${day.day}`).valueOf(),
          day.outcomming,
        ];

        return [a, b];
      }))
      .sort((a, b) => a[0] - b[0]));

    if (daysData.length > 1) {
      daysData[1] = daysData[1].map((day) => [
        moment(day[0]).add(1, 'year').valueOf(),
        day[1],
      ]);
    }

    moment.locale('es');
    Highcharts.stockChart('chartContainer', {
      lang: {
        months: moment().localeData().months(),
        weekdays: moment().localeData().weekdays(),
      },
      yAxis: [
        {
          labels: {
            align: 'left',
          },
          height: '100%',
          resize: {
            enabled: true,
          },
        },
      ],
      tooltip: {
        shape: 'square',
        headerShape: 'callout',
        borderWidth: 0,
        shadow: false,
      },
      series: [
        {
          type: 'areaspline',
          id: 'aapl-volume',
          name: `Salidas ${
            this.yearOptions[1]?.text ?? this.yearOptions[0].text
          }`,
          data: daysData[0],
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1,
            },
            stops: [
              [0, '#7cb5ec'],
              [1, 'rgba(124,181,236,0)'],
            ],
          },
        },

        {
          type: 'spline',
          id: 'aapl-volume',
          name: `Salidas ${this.yearOptions[0].text}`,
          data: [...(daysData[1] ?? [])].map((data) => [
            moment(data[0]).add(1, 'week').valueOf(),
            data[1],
          ]),
          color: '#FF0000',
        },
      ],
      responsive: {
        rules: [
          {
            condition: {
              maxWidth: 800,
            },
            chartOptions: {
              rangeSelector: {
                inputEnabled: false,
              },
            },
          },
        ],
      },
    });
  }
}
</script>

<style lang="scss">
.cs-header {
  font-size: 20px;
  font-weight: bold;
}

#container,
.chart-container {
  width: 600px;
  height: 600px;
}

.highcharts-bindings-wrapper * {
  box-sizing: content-box;
}

.highcharts-credits {
  display: none;
}
</style>
