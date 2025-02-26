<template>
  <div class="min-h-screen bg-[#DFCCAF] overflow-x-hidden max-w-[600px] mx-auto">
    <!-- <header v-if="userName" class="flex justify-between items-center fixed top-0 left-0 w-full bg-[#be9b7b] px-4 py-2 z-[99]">
      <div class="flex items-center gap-2">
        <h1 class="text-title text-white">DS Spends</h1>
      </div>
      <div class="flex items-center gap-x-2">
        <p class="leading-none text-white"> {{ userName.split(" ")[0] }}</p>
        <span class="leading-none text-white">|</span>
        <LogoutButton />
      </div>
    </header> -->
    <main class="p-4 pt-0">
      <NuxtPage />
    </main>
  </div>
</template>
<script setup>
import { useRoute, useRouter } from 'vue-router'
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const route = useRoute()
const router = useRouter()
const userName = ref('');

onMounted(() => {
  if(localStorage.getItem("userDS")) {
    const theUser = JSON.parse(localStorage.getItem("userDS"))
    userName.value = theUser.displayName;
    useState('userId', () => theUser.email)
    useState('userName', () => theUser.displayName)
    router.push('/spends');
  } else {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        userName.value = user.displayName;
        const userDS = {
          userId: user.email,
          displayName: user.displayName
        };
        localStorage.setItem("userDS", JSON.stringify(userDS));
        useState('userId', () => user.email)
        useState('userName', () => user.displayName)
      }

      router.push(!user ? '/login' : '/spends');
    });
  }
});
</script>
  