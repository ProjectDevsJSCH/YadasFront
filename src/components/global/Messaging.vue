<template>
  <v-snackbar
    v-model="snackbar"
    :timeout="time"
    :color="snackbarType"
  >
    <h3>{{ title }}</h3>
    <div>{{ message }}</div>
    <template v-slot:action="{ attrs }">
      <v-btn
        color="white"
        text
        v-bind="attrs"
        @click="snackbar = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import { MessageTypes } from '@/instance/global-messaging';

@Component({
  name: 'Messaging',
})
export default class Layout extends Vue {
  public snackbar = false;

  public title = '';

  public time = -1;

  public type: MessageTypes = MessageTypes.INFO;

  public message = '';

  get snackbarType() {
    const colorMapping = {
      [MessageTypes.ERROR]: 'error',
      [MessageTypes.SUCCESS]: 'success',
      [MessageTypes.WARNING]: 'error',
      [MessageTypes.INFO]: 'primary',
    };

    return colorMapping[this.type];
  }

  mounted() {
    this.$store.subscribe((mutation, state) => {
      if (mutation.type === 'messaging/setGlobalMessage') {
        const { messaging } = state;

        this.title = messaging.title;
        this.message = messaging.message;
        this.time = messaging.time;
        this.type = messaging.type;
        this.snackbar = true;
      }
    });
  }
}
</script>
