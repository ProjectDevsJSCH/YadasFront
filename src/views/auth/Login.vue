<template>
  <div class="container flex items-center w-screen h-screen mx-auto">
    <!-- Login Card -->
    <div
      class="flex max-w-sm p-6 mx-auto bg-gray-100 border border-gray-200 border-solid rounded-lg shadow-md"
    >
      <div
        @keydown.enter="login"
        class="w-full pt-1"
      >
        <h4 class="mb-10 text-xl leading-tight text-gray-900">Bienvenido a Yadas</h4>

        <v-text-field
          label="Correo"
          v-model="email"
        />
        <v-text-field
          class="mt-5"
          type="password"
          label="Contraseña"
          v-model="password"
        />

        <v-btn
          @click="login"
          epressed
          color="primary"
        >
          Ingresar
        </v-btn>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import jwt from 'jsonwebtoken';
import { MessageTypes } from '@/instance/global-messaging';

@Component({})
export default class Login extends Vue {
  /* Login */
  public email = '';

  public password = '';

  async login() {
    const { email, password } = this;

    try {
      const { data } = await this.$http.post('/auth/signin', {
        email,
        password,
      });

      localStorage.setItem('token', data.accessToken);
      this.$router.push({ name: 'Home' });
      this.$report({
        title: 'Inicio de sesion exitoso',
        message: 'Bienvenido',
      });
    } catch (error) {
      const { data } = error.response;

      this.$report({
        title: 'Credenciales invalidas',
        message: data.message,
        type: MessageTypes.ERROR,
      });
    }
  }
}
</script>
