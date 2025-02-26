<template>
  <div class="w-full max-w-[600px] mx-auto">
    <h3 class="text-center w-full text-white text-2xl font-bold leading-none text-curency pb-2">Monthly Budget</h3>
    <div class="h-[65vh] overflow-y-auto hide-scrollbar">
      <div v-if="showBudgetConfig">
        <div v-for="(cat, key) in theCategories" class="mb-5" :key="key">
          <div class="w-full">
            <div>
              <div class="flex items-center justify-between">
                <label :for="cat.id" class="block text-white leading-none mb-[2px]">{{ cat.label }}</label>
                <label class="switch">
                  <input type="checkbox" v-model="cat.active">
                  <div class="slider round"></div>
                </label>
              </div>
              <div v-if="cat.active" class="relative">
                <span class="absolute left-2 top-[50%] translate-y-[-50%]">Rp. </span>
                <input
                  :id="cat.id"
                  v-model="cat.value"
                  type="text"
                  inputmode="numeric"
                  class="mt-1 block w-full rounded-md focus:outline-none py-1 px-2 pl-[30px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <highchart v-if="panelIsShowed":options="chartOptions"></highchart>
        <div class="mt-[-140px] lg:mt-[-270px] px-1.5">
          <div class="border-t border-dashed border-[#be9b7b] pt-4">
            <div v-for="(cat, key) in theCategories" :key="key" class="mb-4">
              <BudgetProgress :category="cat.id" :spendingDataByEmail="spendingData" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="mt-4 mb-1">
      <div
        v-if="showBudgetConfig"
        class="w-full text-white text-title text-center flex gap-x-6"
      >
        <div class="bg-[#be9b7b] py-2 px-4 rounded cursor-pointer w-full" 
        @click="showBudgetConfig = false">
          Cancel
        </div>
        <div 
          class="bg-[#ed3434] py-2 px-4 rounded cursor-pointer w-full" 
          @click="submitBudget()">
            {{ isLoading ? "Loading..." : "Save" }}
        </div>
      </div>
      <div
        v-else
        class="w-full bg-[#ff5d28] text-white py-2 px-4 rounded text-title text-center cursor-pointer"
        @click="showBudgetConfig = true"
      >
        Go to Budget Config
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  categories: {
    type: Array,
    default: [],
  },
  spendingData: {
    type: Array,
    default: [],
  },
  panelIsShowed: {
    type: Boolean,
    default: false,
  }
});
const isLoading = ref(false);
const theCategories = ref([]);
const emit = defineEmits(['updateBudgetData']);

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value).replace('IDR', 'Rp');
}
const colorChart = ref(['#cf1a1c', '#fb9a99']);
const chartOptions = computed(() => {
  return {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: '100%'
    },
    title: {
      text: `Planned Budget<br><span class="text-[20px]">${formatCurrency(totalBudget.value)}</span>`,
      align: 'center',
      verticalAlign: 'middle',
      y: -30,
      style: {
          fontSize: '14px',
          fontFamily: 'Carrois Gothic',
          color: '#fff'
      }
    },
    legend: {
        layout: 'horizontal',
        align: 'center',
        verticalAlign: 'top',
        floating: true,
        y: 155,
        itemStyle: {
          color: "#fff",
          fontFamily: 'Carrois Gothic',
          fontSize: '12px'
        }
    },
    colors: colorChart.value,
    series: [{
      name: 'Spending',
      colorByPoint: true,
      innerSize: '70%',
      data: [
        {
            name: 'Spending',
            y: totalSpending.value
        },
        {
            name: 'Budget Remains',
            y: totalSpending.value > totalBudget.value ? 0 : totalBudget.value - totalSpending.value
        },
      ],
      dataLabels: {
          enabled: false
      }
    }],
    tooltip: {
      formatter: function () {
        const value = this.y?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        return `<b>${this.key}</b><br>Rp ${value}`;
      }
    },
    plotOptions: {
      pie: {
        plotBorderWidth: null,
        plotShadow: false,
        showInLegend: true,
        startAngle: -90,
        endAngle: 90,
        center: ['50%', '50%'],
        size: '100%'
      }
    },
  }
});

const showBudgetConfig = ref(true);

const submitBudget = async () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const reformatBudgetVal = theCategories.value.map(item => {
    return {
      ...item,
      value: parseInt(item.value) ? parseInt(item.value) : 0,
    };
  });
  try {
    await useFetch('/api/spending-budget', {
      method: 'POST',
      body: {
        email: useState('userId').value.split("@")[0],
        yearMonth: `${year}${month}`,
        budgetCategories: reformatBudgetVal,
      },
    });
    isLoading.value = false;
    showBudgetConfig.value = false;
    emit('updateBudgetData', true)
    checkBudgetData()
  } catch (error) {
    console.error('Error adding spending record: ', error);
    isLoading.value = false;
  }
}

const totalBudget = ref(0)
const totalSpending = ref(0)
const checkBudgetData = async() => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const yearMonth = `${year}${month}`;
  const email = useState('userId').value.split("@")[0];

  let budgetData = null;
  try {
    const spendingDoc = await useFetch(`/api/get-spending/${yearMonth}/${email}`);
    if (spendingDoc.data._value) {
      budgetData = spendingDoc.data._value;
    } else {
      const budgetDoc = await useFetch(`/api/get-budget/${email}`);
      if (budgetDoc.data._value) {
        budgetData = budgetDoc.data._value.budget;
      }
    }
    showBudgetConfig.value = false;
  } catch (error) {
    console.error("Error fetching budget data:", error);
  }

  theCategories.value = props.categories.map(item => {
    const budgetItem = budgetData ? budgetData[item.id] : null;
    return {
      ...item,
      active: !!budgetItem,
      value: parseInt(budgetItem) ? parseInt(budgetItem) : null,
    };
  });

  totalBudget.value = theCategories.value.reduce((sum, cate) => {
    return cate.active && cate.value ? sum + cate.value : sum;
  }, 0);
  
  let totalSpend = 0;
  props.spendingData.forEach(day => {
      day.spendingData.forEach(spendingItem => {
          totalSpend += spendingItem.spending;
      });
  });
  totalSpending.value = totalSpend

  useState('budgetData', () => theCategories.value);
}

watch(() => props.panelIsShowed, () => {
  if(props.panelIsShowed) {
    checkBudgetData();
  }
})
onMounted(async () => {
  await checkBudgetData();
});
</script>
  