<template>
  <div>
    <div class="flex items-center w-screen h-screen mx-auto bg-gray-400">
      <!-- Login Card -->
      <div
        class="flex max-w-sm p-6 mx-auto bg-gray-100 border border-gray-200 border-solid rounded-lg shadow-md"
      >
        <div
          @keydown.enter="createAccount"
          class="w-full pt-1"
        >
          <h4 class="mb-10 text-xl leading-tight text-gray-900">Establecer contraseña</h4>

          <v-text-field
            label="Nueva contraseña"
            type="password"
            v-model="password"
          />

          <v-text-field
            label="Confirmar contraseña"
            type="password"
            v-model="passwordConfirm"
          />

          <v-btn
            color="primary"
            dark
            @click="createAccount"
          >
            Crear cuenta
          </v-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { AuthApi } from '@/api';
import { MessageTypes } from '@/instance/global-messaging';
import { Vue, Component } from 'vue-property-decorator';

@Component({})
export default class PasswordSetup extends Vue {
  public password = '';
  public passwordConfirm = '';
  public token = '';

  async mounted() {
    const { query } = this.$route;

    if (query.key) {
      this.token = query.key as string;
    }
  }

  async createAccount() {
    if (!this.password || !this.passwordConfirm) {
      this.$report({
        title: 'Ambos campos son necesarios',
        type: MessageTypes.ERROR,
      });
    }

    if (this.password !== this.passwordConfirm) {
      this.$report({
        title: 'Las contraseñas no coinciden',
        type: MessageTypes.ERROR,
      });

      return;
    }

    try {
      await this.$useLoader(AuthApi.setPassword(this.password, this.token));

      this.$report({
        title: 'La contraseña ha sido establecida',
        message: MessageTypes.SUCCESS,
      });

      setTimeout(() => {
        this.$router.push({
          name: 'AuthLogin',
        });
      }, 4000);
    } catch (error) {
      this.$report({
        title: 'No fue posible establecer la contraseña',
        message: MessageTypes.ERROR,
      });
    }
  }
}
</script>
