<template>
  <form @submit.prevent="submitForm" class="space-y-3 w-full max-w-[640px] mx-auto">
    <div>
      <label class="block text-white leading-none mb-[2px]">Date</label>
      <VueDatePicker v-model="dateChoosen" placeholder="Choose the month" :max-date="new Date()" />
    </div>
    <div>
      <label for="category" class="block text-white leading-none mb-[2px]">Category</label>
      <select id="category" v-model="category" class="block w-full rounded-md focus:outline-none p-2">
          <option v-for="cat in categories" :key="cat" :value="cat.id">{{ cat.label }}</option>
      </select>
    </div>
    <div>
      <label for="spending" class="block text-white leading-none mb-[2px]">Spending</label>
      <div class="relative">
        <span class="absolute left-2 top-[50%] translate-y-[-50%]">Rp. </span>
        <input
          id="spending"
          v-model="spendingDisplayValue"
          @input="formatNumber"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          class="mt-1 block w-full rounded-md focus:outline-none p-2 pl-[30px]"
          required
        />
      </div>
    </div>
    <div>
      <label for="notes" class="block text-white leading-none mb-[2px]">Notes</label>
      <textarea
        id="notes"
        v-model="notes"
        class="block w-full rounded-md focus:outline-none p-2"
      ></textarea>
    </div>
    <div>
      <button
        type="submit"
        class="w-full bg-[#ed3434] text-white py-2 px-4 rounded text-title mt-4"
      >
        {{ isLoading ? "Loading..." : "Submit" }}
      </button>
    </div>
    <BudgetProgress :category="category" :spendingDataByEmail="spendingData" />
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useFetch } from '#app';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { defineEmits } from 'vue'

const category = ref('food-beverage');
const notes = ref('');
const userId = ref('');
const userName = ref('');
const dateChoosen = ref(new Date());
const monthFormatToSend = ref('');
const dayFormatToSend = ref('');

const spendingOriginalValue = ref(0);
const spendingDisplayValue = ref(0);

function formatNumber(event) {
  const value = event.target.value.replace(/\./g, '').replace(/\D/g, '');
  spendingOriginalValue.value = value;
  spendingDisplayValue.value = new Intl.NumberFormat('de-DE').format(value);
}

watch(spendingOriginalValue, (newVal) => {
  spendingDisplayValue.value = new Intl.NumberFormat('de-DE').format(newVal);
});

const props = defineProps({
  categories: {
    type: Object,
    default: null,
  },
  spendingData: {
    type: Array,
    default: [],
  },
});

watch(dateChoosen, () => {
  formatingDate(dateChoosen.value);
})

watch(category, () => {
  console.log("change cate", category.value, useState('budgetData').value.find(x => x.id === category.value)?.value, props.spendingData);
})


const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value).replace('IDR', 'Rp');
}

onMounted(() => {
  formatingDate(new Date());
  const theLS = localStorage.getItem("userDS")
  userId.value = theLS ? JSON.parse(theLS).userId : useState('userId')
  userName.value = theLS ? JSON.parse(theLS).displayName : useState('displayName');
});

const formatingDate = (theDate) => {
  const date = new Date(theDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  monthFormatToSend.value = `${year}${month}`;
  dayFormatToSend.value = date.getDate();
}

const isLoading = ref(false);
const emit = defineEmits(['newData'])
const submitForm = async () => {
  if(isLoading.value) return;
  const date = dateChoosen.value;
  const day = String(dayFormatToSend.value).padStart(2, '0');
  const dayOfWeek = date.toLocaleDateString('default', { weekday: 'long' });

  const dayDetail = {
    date,
    day: dayOfWeek,
  };

  const spendingData = {
    userId: userId.value,
    userName: userName.value,
    category: category.value,
    date,
    spending: parseInt(spendingOriginalValue.value),
    notes: notes.value,
    day
  };

  isLoading.value = true;
  try {
    await useFetch('/api/spending', {
      method: 'POST',
      body: {
        yearMonth: monthFormatToSend.value,
        day,
        dayDetail,
        spendingData,
      },
    });

    spendingOriginalValue.value = null;
    notes.value = '';
    emit('newData', spendingData)
    isLoading.value = false;
  } catch (error) {
    console.error('Error adding spending record: ', error);
    isLoading.value = false;
  }
};
</script>
  