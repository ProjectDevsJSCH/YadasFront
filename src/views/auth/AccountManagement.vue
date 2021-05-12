<template>
  <div class="flex items-center w-screen h-screen mx-auto bg-blue-800">
    <!-- Login Card -->
    <div
      class="flex max-w-sm p-6 mx-auto bg-gray-100 border border-gray-200 border-solid rounded-lg shadow-md"
    >
      <div
        @keydown.enter="login"
        class="w-full pt-1"
      >
        <h4 class="mb-10 text-xl leading-tight text-gray-900">Gestor de cuentas</h4>

        <v-text-field
          label="Nombre"
          v-model="name"
        />

        <v-text-field
          label="Apellido"
          v-model="surname"
        />

        <v-text-field
          label="Correo"
          type="email"
          v-model="email"
        />

        <v-select
          :items="enterpriseOptions"
          v-model="enterprise"
          label="Empresa"
        />

        <div class="text-center">
          <v-btn
            class="ma-2"
            outlined
            color="indigo"
            small
            @click="generatePassword"
          >
            Generar contraseña
          </v-btn>
        </div>

        <v-text-field
          class="mt-5"
          type="password"
          label="Contraseña"
          v-model="password"
        />

        <v-text-field
          class="mt-5"
          type="password"
          label="Verificar contraseña"
          v-model="passwordVerify"
        />

        <v-select
          :items="rolesOptions"
          v-model="role"
          label="Rol"
        />

        <v-dialog
          v-model="dialog"
          persistent
          max-width="500"
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="primary"
              dark
              v-bind="attrs"
              v-on="on"
            >
              Crear cuenta
            </v-btn>
          </template>
          <v-card>
            <v-card-title class="headline">
              Confirmar creación
            </v-card-title>

            <v-card-text>
              <div class="text-right">
                <!-- Clipboard copy -->
                <v-btn
                  data-clipboard-target="#account-data"
                  id="copyAccountData"
                  icon
                  color="indigo"
                >
                  <v-icon>mdi-content-copy</v-icon>
                </v-btn>
              </div>

              <div>
                <div class="flex justify-between px-4 py-2 my-2 border border-gray-500 rounded">
                  <b>Nombre: </b> <span>{{ name }}</span>
                </div>
                <div class="flex justify-between px-4 py-2 my-2 border border-gray-500 rounded">
                  <b>Apellido: </b> <span>{{ surname }}</span>
                </div>
                <div class="flex justify-between px-4 py-2 my-2 border border-gray-500 rounded">
                  <b>Empresa: </b> <span>{{ selectedEnterprise }}</span>
                </div>
                <div class="flex justify-between px-4 py-2 my-2 border border-gray-500 rounded">
                  <b>Correo: </b> <span>{{ email }}</span>
                </div>
                <div class="flex justify-between px-4 py-2 my-2 border border-gray-500 rounded">
                  <b>Contraseña: </b> <span>{{ password }}</span>
                </div>
                <div class="flex justify-between px-4 py-2 my-2 border border-gray-500 rounded">
                  <b>Rol: </b> <span>{{ selectedRole }}</span>
                </div>
              </div>

              <textarea id="account-data" class="w-1 h-1" v-model="accountData" />
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn
                color="red darken-1"
                text
                @click="dialog = false"
              >
                Cancelar
              </v-btn>
              <v-btn

                color="blue darken-1"
                text
                @click="createAccount"
              >
                Confirmar
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import Clipboard from 'clipboard';

import { EnterprisesApi, RolesApi, UsersApi } from '@/api';
import passwordGenerator from 'password-generator';
import { MessageTypes } from '@/instance/global-messaging';
import { capitalize } from 'lodash';

@Component({})
export default class AccountManagement extends Vue {
  public email = '';
  public password = '';
  public name = '';
  public surname = '';
  public enterprise = -1;
  public role = -1;
  public rolesOptions: { text: string; value: number}[] = [];
  public enterpriseOptions: { text: string; value: number}[] = [];
  public passwordVerify = '';
  public dialog = false;

  private MIN_PASSWORD_LENGTH = 8;

  async beforeMount() {
    await this.$useLoader(this.initializeData());
  }

  mounted() {
    const clipboard = new Clipboard('#copyAccountData');

    clipboard.on('success', () => {
      this.$report({
        title: 'Credenciales copiadas',
        message: 'Las credenciales han sido copiadas al portapapeles',
        type: MessageTypes.INFO,
        time: 5000,
      });
    });
  }

  get selectedRole() {
    if (this.role === -1) return '';

    return this.rolesOptions.find((role) => role.value === this.role)?.text;
  }

  get selectedEnterprise() {
    if (this.enterprise === -1) return '';

    return this.enterpriseOptions.find((enterprise) => enterprise.value === this.enterprise)?.text;
  }

  get accountData() {
    return `
    CREDENCIALES NUEVA CUENTA:

    Nombre: ${this.name}
    Apellido: ${this.surname}
    Empresa: ${this.selectedEnterprise}
    Correo: ${this.email}
    Contraseña: ${this.password}
    Rol: ${this.selectedRole}
    `;
  }

  async createAccount() {
    if (!this.validate()) return;

    this.dialog = false;

    try {
      await this.$useLoader(
        UsersApi.createUser({
          name: this.name,
          surname: this.surname,
          enterprise: String(this.enterprise),
          email: this.email,
          rol: String(this.role),
          password: this.password,
        }),
      );

      this.$report({
        title: 'El usuario ha sido creado',
        type: MessageTypes.SUCCESS,
      });
    } catch (error) {
      this.$report({
        title: 'No fue posible crear el usuario',
        message: `Error: ${error}`,
        type: MessageTypes.ERROR,
      });
    }
  }

  validate() {
    // eslint-disable-next-line no-control-regex
    const emailRegex = new RegExp(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/);

    if (!emailRegex.test(this.email)) {
      this.$report({
        title: 'Correo no válido',
        type: MessageTypes.ERROR,
      });

      return false;
    }

    if (this.password !== this.passwordVerify) {
      this.$report({
        title: 'Las contraseñas no coinciden',
        type: MessageTypes.ERROR,
      });

      return false;
    }

    if (this.password.length < this.MIN_PASSWORD_LENGTH) {
      this.$report({
        title: `La contraseña debe contener por lo menos ${this.MIN_PASSWORD_LENGTH} caracteres`,
        type: MessageTypes.ERROR,
      });
    }

    return true;
  }

  generatePassword() {
    const generated = passwordGenerator(this.MIN_PASSWORD_LENGTH, false);

    this.password = generated;
    this.passwordVerify = generated;
  }

  private async initializeData() {
    this.rolesOptions = (await RolesApi.getAll())
      .map((role) => ({ text: role.alias, value: role.id }));

    this.enterpriseOptions = (await EnterprisesApi.getAll())
      .map((enterprise) => ({ text: capitalize(enterprise.enterprise), value: enterprise.id }));
  }
}
</script>
