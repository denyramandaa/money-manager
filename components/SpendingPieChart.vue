<template>
  <div v-if="spendingData" class="w-full max-w-[640px] mx-auto pt-[40px]">
    <h3 class="text-center w-full text-white text-2xl mb-1"><span class="font-bold">{{ spendingMonth }}</span></h3>
    <div class="text-center w-full text-white text-5xl font-bold leading-none text-curency">
      {{ calculateTotalSpending(spendingData) }}
    </div>
    <div class="text-center w-full text-white mt-1 text-sm">
      <p class="leading-none mb-1" v-html="formatSpendingByUser(calculateSpendingByUser(spendingData))"></p>
    </div>
    <div v-if="showBarChart" class="w-full mt-4">
      <div class="w-full relative z-[2]">
        <div class="w-full mb-3 capitalize" v-for="(item, key) in theDataInPercent">
          <div class="w-full">
            <p class="text-white flex items-center gap-x-1 cursor-pointer w-max" @click="openDetailByCategory(item.name)">{{ item.name.replaceAll("-", " ") }} <Icon class="mt-[-2px] text-[12px] block text-[#DFCCAF]" name="ion:ios-arrow-forward" /></p>
          </div>
          <div class="px-2 py-[3px] rounded flex justify-between items-center leading-none relative">
            <div class="absolute h-full min-w-[12%] left-0 top-0" :style="{backgroundColor: `${colorChart[key]}`, width: item.percent+'%'}"></div>
            <span class="text-xs text-title text-[#fff] relative drop-shadow-lg">{{ item.percent }}%</span>
            <p class="text-white text-xs relative drop-shadow-lg text-curency">{{ formatCurrency(item.y) }}</p>
          </div>
        </div>
      </div>
      <div class="w-full relative z-[1] mt-[-60px]">
        <highchart :options="chartOptions"></highchart>
      </div>
    </div>
    <div v-else class="w-full relative mt-4">
      <div class="text-center w-full text-white text-2xl leading-none relative py-4">
        <h3 class="capitalize">{{ openCategory.replaceAll("-", " ") }} <span class="block text-3xl text-curency">{{ formatCurrency(spendingDataByCatSpends) }}</span></h3>
        <div class="absolute left-[2px] top-[50%] translate-y-[-50%] cursor-pointer" @click="showBarChart = true">
          <Icon class="text-[24px] block text-[#DFCCAF]" name="ion:ios-arrow-back" />
        </div>
      </div>
      <BudgetProgress :category="openCategory" :spendingDataByEmail="spendingDataByEmail" />
      <div class="relative">
        <div v-for="(item, key) in spendingDataByCat" class="py-4 border-b border-dashed border-[#be9b7b] leading-none text-white">
          <div class="text-sm flex items-center justify-between text-[#dfccaf]">
            <p>{{ item.userName }}</p>
            <p>{{ formatDateFirestore(item.date, true) }}</p>
          </div>
          <p class="text-3xl font-bold text-curency">{{ formatCurrency(item.spending) }}</p>
          <p class="text-sm">{{ item.notes }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';


const showBarChart = ref(true)
const props = defineProps({
  spendingData: {
    type: Array,
  },
  spendingMonth: {
    type: String,
  },
  spendingDataByEmail: {
    type: Array,
  },
});

const theData = ref()
const theDataInPercent = ref()
const colorChart = ref(['#a6cee3', '#fdbf6f', '#b2df8a', '#cab2d6', '#fb9a99', '#cf1a1c', '#ff7f00', '#1f78b4', '#6a3d9a', '#33a02c', '#d82e72', '#6b5928']);
const chartOptions = computed(() => {
  return {
      chart: {
        type: 'pie',
        backgroundColor: 'transparent'
      },
      title: {
        text: '',
      },
      colors: colorChart.value,
      series: [{
        name: 'Spending',
        colorByPoint: true,
        data: theData.value,
        dataLabels: {
            enabled: false,
            style: {
                color: 'white'
            }
        }
      }],
      tooltip: {
        formatter: function () {
          const value = this.y?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
          return `<b>${this.key}</b><br>Rp ${value}`;
        }
      },
      plotOptions: {
        series: {
            allowPointSelect: true,
            innerSize: '30%',
            cursor: 'pointer',
            dataLabels: [{
                enabled: false,
                distance: 20
            }, {
                enabled: true,
                distance: -40,
                format: '{point.percentage:.1f}%',
                style: {
                    fontSize: '1.2em',
                    textOutline: 'none',
                    opacity: 0.7
                },
                filter: {
                    operator: '>',
                    property: 'percentage',
                    value: 10
                }
            }]
        }
    },
  }
});

const openCategory = ref("")
const openDetailByCategory = (id) => {
  filterCat(id);
  openCategory.value = id;
  showBarChart.value = false;
}

const spendingDataByCat = ref();
const spendingDataByCatSpends = ref();
const filterCat = (cat) => {
  let filteredSpending = [];
  props.spendingData.forEach(day => {
    const spendingDataFilter = day.spendingData.filter(item => item.category === cat);
    filteredSpending = filteredSpending.concat(spendingDataFilter);
  });

  spendingDataByCat.value = filteredSpending;
  spendingDataByCatSpends.value = filteredSpending.reduce((sum, item) => sum + item.spending, 0);
}

const calculateSpendingByUser = (data) => {
  const spendingByUser = {};

  data.forEach(entry => {
    entry.spendingData.forEach(spending => {
      const userId = spending.userId;
      const userName = spending.userName;
      if (!spendingByUser[userId]) {
        spendingByUser[userId] = { name: userName, totalSpending: 0 };
      }
      spendingByUser[userId].totalSpending += spending.spending;
    });
  });

  return spendingByUser;
}

const formatSpendingByUser = (spendingByUser) => {
  return Object.values(spendingByUser).map(user => `${user.name.split(" ")[0]}: <span class="text-lg text-curency">${formatCurrency(user.totalSpending)}</span>`).join(' ⟺ ');
}


const formatDateFirestore = (timestamp, showDate) => {
    const date = timestamp?._seconds ? new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000) : new Date(timestamp);
    const options = { weekday: 'long', day: '2-digit', month: 'long' };
    return new Intl.DateTimeFormat('en-US', options).format(date);
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(value).replace('IDR', 'Rp');
}

const calculateTotalSpending = (data) => {
  const dataReduce = data.reduce((total, entry) => {
    const entrySpending = entry.spendingData.reduce((entryTotal, spending) => entryTotal + spending.spending, 0);
    return total + entrySpending;
  }, 0);
  return formatCurrency(dataReduce);
}
watch(() => props.spendingData, (newValue, oldValue) => {
  updateChartData()
})
const updateChartData = () => {
  const flattenedSpendingData = props.spendingData.flatMap(day => day.spendingData);
  const spendingByCategory = flattenedSpendingData.reduce((acc, entry) => {
      if (!acc[entry.category]) {
          acc[entry.category] = 0;
      }
      acc[entry.category] += entry.spending;
      return acc;
  }, {});
  const highchartsData = Object.entries(spendingByCategory).map(([name, y]) => ({ name, y }));

  highchartsData.sort((a, b) => b.y - a.y);
  theData.value = highchartsData
  
  const totalSpending = highchartsData.reduce((acc, entry) => acc + entry.y, 0);
  
  theDataInPercent.value = highchartsData.map(entry => {
    const percentage = (entry.y / totalSpending) * 100;
    return {
      name: entry.name,
      y: entry.y,
      percent: percentage.toFixed(2)
    };
  });
  filterCat(openCategory.value);
};
watch(props.spendingData, updateChartData, { immediate: true });

</script>
  