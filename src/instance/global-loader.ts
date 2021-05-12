import { MessageTypes } from './global-messaging';

export async function useLoader<T>(this: Vue, promise: Promise<T>) {
  this.$store.commit('loader/setLoading', true);

  try {
    return await promise;
  } catch (error) {
    this.$report({
      title: 'Error',
      message: 'La operación no ha podido ser completada',
      time: 3000,
      type: MessageTypes.ERROR,
    });

    throw error;
  } finally {
    this.$store.commit('loader/setLoading', false);
  }
}
