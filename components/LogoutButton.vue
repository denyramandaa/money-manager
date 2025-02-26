<template>
    <div class="bg-[#6F4436] rounded px-1 py-[2px] text-white" @click="logout">Logout</div> 
</template>
  
<script setup>
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'vue-router';

const router = useRouter();

const logout = async () => {
    localStorage.removeItem("userDS");
    const auth = getAuth();
    await signOut(auth);
    router.push('/login');
};
</script>