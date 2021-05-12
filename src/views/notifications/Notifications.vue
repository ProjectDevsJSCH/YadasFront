<template>
  <div>
    <!-- Filters -->
    <div class="max-w-lg mx-auto mt-4">
      <v-select
        v-model="selectedNotifications"
        :items="notificationTypes"
        chips
        label="Notificaciones"
        multiple
        outlined
      />
    </div>

    <transition-group name="list" tag="div">
      <v-card
        v-for="notification in filteredData"
        :key="notification.id"
        elevation="2"
        max-width="600px"
        class="mx-auto my-4 relative"
      >
        <div class="absolute right top-0 right-0  pt-2 pr-2">
          <v-btn
            fab
            dark
            x-small
            color="primary"
            @click="searchItem(notification.producto.Referencia)"
          >
            <v-icon dark>
              mdi-clipboard-text-search-outline
            </v-icon>
          </v-btn>
        </div>

        <div class="grid grid-cols-8 divide-x divide-gray-400 max-w-lg">
          <div class="p-4 max-w-xs col-span-3 flex justify-center flex-col">
            <span> <b>ID:</b>  {{ notification.idProducto }}</span>
            <div>
              <v-icon>mdi-clock-time-nine-outline</v-icon>
              <span class="">{{ notification.formattedDate }}</span>
            </div>
          </div>
          <div class="col-span-5 relative">
            <v-card-title>
              {{ notification.producto.Referencia }}
            </v-card-title>
            <v-card-text>{{ notification.producto.Descripcion }}</v-card-text>
            <v-card-text>
              <v-chip
                :color="notification.notificationColor" dark
              >
                {{ notification.tipo }}
              </v-chip>
            </v-card-text>
          </div>
        </div>
      </v-card>
    </transition-group>
  </div>
</template>

<script lang="ts">
/* eslint-disable @typescript-eslint/no-non-null-assertion */

import { NotificationsApi } from '@/api/notifications.api';
import { MerchandiseNotificationTypes } from '@/model/notification/notification-types.enum';
import { Notification, NotificationUI } from '@/model/notification/notification.model';
import { Vue, Component } from 'vue-property-decorator';
import moment from 'moment';

@Component({})
export default class Layout extends Vue {
  public notifications: NotificationUI[] = [];
  public notificationTypes: MerchandiseNotificationTypes[] = [];
  public selectedNotifications: MerchandiseNotificationTypes[] = [];

  public daysDivision: Record<string, NotificationUI[]> = {}

  get filteredData() {
    return this.notifications
      .filter((notification) => this.selectedNotifications.includes(notification.tipo));
  }

  async beforeMount() {
    this.notifications = (await this.$useLoader(NotificationsApi.getAll()))
      .filter((notification) => moment().diff(notification.fecha, 'days') <= 30)
      .map((notification) => notification.toUI());

    this.notifications.forEach((notification) => {
      if (!this.daysDivision[notification.formattedDate!]) {
        this.daysDivision[notification.formattedDate!] = [];
      }

      this.daysDivision[notification.formattedDate!].push(notification);
    });
    this.notificationTypes = Notification.notificationTypes();
    this.selectedNotifications = Notification.notificationTypes();
  }

  searchItem(reference: string) {
    this.$router.push({
      name: 'Home',
      query: {
        s: reference,
      },
    });
  }
}
</script>

<style lang="scss" scoped>

.list-enter-active, .list-leave-active {
  transition: all 0.5s;
}

.list-enter, .list-leave-to{
  opacity: 0;
  transform: translateY(30px);
}

</style>
