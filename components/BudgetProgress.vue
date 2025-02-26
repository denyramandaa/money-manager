<template>
    <div v-if="getBudgetByCat" class="text-white pt-[0] pb-[54px] border-b border-dashed border-[#be9b7b]">
        <div class="flex items-center justify-between text-white w-full text-xs mb-1 relative">
          <div class="flex items-center gap-x-1">
              <Icon class="text-[16px] block" :name="findIcon(category)" />
              <span class="capitalize mt-1 text-sm">{{ category.split("-").join(" ") }}</span>
          </div>
          <span class="text-curency leading-none">{{ formatCurrency(getBudgetByCat) }}</span>
        </div>
        <div class="relative w-full h-[20px] bg-white/30">
            <div 
            class="absolute left-0 top-0 h-full flex items-center justify-end text-xs max-w-[100%]" 
            :style="{ width: getPercentage(totalSpendingByCat, getBudgetByCat)+'%'}" 
            :class="{ 'bg-[#439943]': getPercentage(totalSpendingByCat, getBudgetByCat) <= 74 },
                    { 'bg-[#ff7f00]': getPercentage(totalSpendingByCat, getBudgetByCat) >= 75 && getPercentage(totalSpendingByCat, getBudgetByCat) <= 100 },
                    { 'bg-[#ff0000]': getPercentage(totalSpendingByCat, getBudgetByCat) > 100 }">
                    <span v-if="getPercentage(totalSpendingByCat, getBudgetByCat) > 2" class="text-xs pr-2 leading-none text-title drop-shadow">{{ getPercentage(totalSpendingByCat, getBudgetByCat).split(".")[0]+'%' }}</span>
            </div>
            <div class="drop-shadow-lg absolute bottom-0 translate-y-[200%]" :style="{ left: getPercentage(totalSpendingByCat, getBudgetByCat) < 100 ? getPercentage(totalSpendingByCat, getBudgetByCat)+'%' : '100%'}" :class="[ getPercentage(totalSpendingByCat, getBudgetByCat) > 80 ? 'translate-x-[-100%]' : 'translate-x-[-50%]' ]">
                <div class="relative text-curency text-sm">
                    <div class="absolute w-[1px] h-[40px] bg-white top-0 translate-y-[-100%]" :class="[ getPercentage(totalSpendingByCat, getBudgetByCat) > 80 ? 'right-0' : 'left-[50%] translate-x-[-50%]' ]"></div>
                    <span class="pl-4">{{ formatCurrency(totalSpendingByCat) }}</span>
                </div>
            </div>
            <div class="drop-shadow-lg absolute bottom-0 translate-y-[100%] text-xs text-curency pl-[1px]">
                <span 
                    v-if="getPercentage(totalSpendingByCat, getBudgetByCat) <= 100" 
                    :class="[ getPercentage(totalSpendingByCat, getBudgetByCat) <= 74 ? 'text-[#53c353]' : 'text-[#ff7f00]' ]">
                        {{ formatCurrency(getBudgetByCat - totalSpendingByCat) }} remains
                </span>
                <span class="text-[#ff1313] text-sm font-bold" v-else>Over Budget {{ formatCurrency(totalSpendingByCat - getBudgetByCat) }}!</span>
            </div>
        </div>
    </div>
</template>
<script setup>
const props = defineProps({
  category: {
    type: String,
    required: true,
  },
  spendingDataByEmail: {
    type: Array,
    required: true,
  },
});

const theCategories = useCategoriesRegist();

const getBudgetByCat = computed(() => {
  return useState('budgetData').value?.find(x => x.id === props.category)?.value
})

const totalSpendingByCat = computed(() => {
  let filteredSpending = [];
  props.spendingDataByEmail.forEach(day => {
    const spendingDataFilter = day.spendingData.filter(item => item.category === props.category);
    filteredSpending = filteredSpending.concat(spendingDataFilter);
  });
  return filteredSpending.reduce((sum, item) => sum + item.spending, 0);
})

const getPercentage = (val1, val2) => {
  const percentage = (val1 / val2) * 100;
  return percentage.toFixed(2);
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value).replace('IDR', 'Rp');
}

const findIcon = (id) => {
  return allCategories.value.find(x => x.id === id)?.icon
}

const allCategories = ref(theCategories.value);

</script>