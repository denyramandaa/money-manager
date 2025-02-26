<template>
  <div class="fixed w-full h-full top-0 left-0 flex items-center justify-center">
    <div class="max-w-md w-[90%] bg-[#be9b7b] shadow-md rounded-lg p-8">
      <h1 class="text-2xl font-bold mb-6 text-center">GOL.DS</h1>
      <button
        @click="loginWithGoogle"
        class="w-full bg-[#6F4436] text-white py-2 px-4 rounded focus:outline-none focus:shadow-outline"
      >
        Login with Google
      </button>
      <div v-if="error" class="mt-4 text-red-500">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNuxtApp } from '#app';

const error = ref('');

const router = useRouter();
const { $firebaseAuth } = useNuxtApp();

const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup($firebaseAuth, provider);
    router.push('/spends');  // Redirect to the spending form page after successful login
  } catch (err) {
    error.value = err.message;
  }
};
</script>
