<template>
  <v-menu
    offset-y
    transition="slide-y-transition"
    bottom
    right
    z-index="100"
    min-width="400px"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        icon
        class="relative"
        v-bind="attrs"
        v-on="on"
      >
        <v-badge
          :content="notifications.length"
          color="red"
          overlap
        >
          <v-icon large>
            mdi-bell-outline
          </v-icon>
        </v-badge>
      </v-btn>
    </template>

    <v-card max-height="70vh" class="bg-white">
      <div class="max-w-xl bg-white">
        <v-card-text>
          <div class="ml-2 text-lg font-weight-bold">
            Notificaciones
          </div>
        </v-card-text>

        <v-divider />

        <v-card-text>
          <div class="mb-2 ml-8 font-weight-bold">
            Hoy
          </div>

          <v-timeline
            align-top
            dense
          >
            <v-timeline-item
              v-for="notification in notifications"
              :key="notification.id"
              :color="notification.bulletColor"
              small
            >
              <div>
                <div class="font-weight-normal">
                  <b>ID:</b> {{ notification.idProducto }} @{{ notification.formattedDate }}
                </div>
                <div><b>{{ notification.producto.Referencia }}</b></div>
                <div>{{ notification.producto.Descripcion }}</div>
                <v-chip
                  :color="notification.notificationColor" dark
                >
                  {{ notification.tipo }}
                </v-chip>
              </div>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </div>
    </v-card>
  </v-menu>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

import moment from 'moment';

import { NotificationsApi } from '@/api/notifications.api';
import { NotificationDTO } from '@/model/notification/notification.dto';
import { NotificationUI } from '@/model/notification/notification.model';

interface NotificationsUI extends NotificationDTO {
  bulletColor?: string;
  notificationColor?: string;
}

@Component({})
export default class NotificationsResume extends Vue {
  public notifications: NotificationUI[] = [];

  async beforeMount() {
    this.notifications = (await NotificationsApi.getAll())
      .filter((notification) => moment().diff(notification.fecha, 'days') <= 30)
      .map((notification) => notification.toUI());
  }
}
</script>
