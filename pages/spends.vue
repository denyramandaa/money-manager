<template>
<div>
    <div id="spendList" class="h-screen overflow-y-auto pb-[62px] hide-scrollbar">
        <div class="flex justify-between items-center mb-6 pt-[62px]">
            <h2 class="text-2xl font-bold">{{ formatYearMonth(monthChoosen) }}</h2>
            <div class="relative w-[140px]">
                <VueDatePicker v-model="monthChoosen" placeholder="Choose the month" month-picker :max-date="new Date()" :dark="true" />
            </div>
        </div>

        <!-- spending list -->
        <div v-if="!filteredSpendingData || filteredSpendingData.length === 0">
            <p>No spending data found for {{ formatYearMonth(monthChoosen) }}.</p>
        </div>
        <div v-else>
            <section v-for="day in filteredSpendingData" :key="day.id" class="mb-12">
                <div class="flex justify-between items-center mb-2">
                    <h2 class="text-xl font-bold">{{ day.id }} {{ formatDateFirestore(day.date, true) }} - <span class="text-base">{{ day.day }}</span></h2>
                    <span class="text-xl font-bold text-curency">Rp {{ formatCurrency(calculateTotalSpendingByDay(day)?.toString()) }}</span>
                </div>
                <div v-for="item in day.spendingData" :key="item.id" class="p-4 mb-3 shadow-lg rounded w-full relative overflow-hidden" :class="[ item.userId.includes(allowedUser[0]) ? 'bg-[#d7a85f]' : 'bg-[#e5c593]' ]">
                    <div class="flex items-center gap-x-1 mb-1">
                        <Icon class="text-[20px] block text-[#6f4436] leading-none" :name="formatCategory(item.category).icon" />
                        <div class="leading-none mt-1 text-[#6f4436] text-sm">{{ formatCategory(item.category).label }}</div>
                    </div>
                    <p class="text-2xl leading-none text-curency mb-2 text-[#4f2e23]">Rp {{ formatCurrency(item.spending?.toString()) }}</p>
                    <p class="leading-none text-[#6f4436]">{{ item.notes }}</p>
                    <p class="text-xs text-[#6f4436]">{{ item.userName }}</p>
                    <div v-if="item.userId === userId" class="absolute right-[6px] top-[6px] cursor-pointer" @click="showDeleteConfirmation(item.id)">
                        <Icon class="text-[16px] block text-[#6f4436]" name="ion:trash-sharp" />
                    </div>
                    <div class="absolute right-[6px] top-[6px] text-center bg-[#e1e1e1] p-2 rounded" v-if="showDelConf && keyDelConf === item.id">
                        <p>Are you sure want to delete this data?</p>
                        <div class="flex items-center justify-center gap-x-3 mt-1">
                            <div class="px-2 leadingnone cursor-pointer" @click="showDelConf = false">No</div>
                            <div class="px-2 leadingnone bg-[#6F4436] text-white rounded cursor-pointer" @click="deleteCard(item.id, item.day)">Yes</div>
                        </div>
                    </div>
                </div>
            </section>
            <div class="text-center mt-8 mb-12 rounded bg-[#854442] cursor-pointer w-max mx-auto text-[#fff] px-4 py-1 flex items-center gap-x-1 leading-none" @click="scrolToTop()">
                <Icon class="text-[20px] block mx-auto" name="ion:md-arrow-dropup" />
                <span class="mt-1">Back to Top</span>
            </div>
        </div>
    </div>


    <!-- Filter Menu -->
    <div class="fixed top-2 left-[50%] translate-x-[-50%] z-[100] shadow-xl">
        <div class="flex bg-[#854442] text-white font-normal py-1 px-2 rounded gap-x-2 items-center">
            <div class="p-1 rounded leading-none cursor-pointer" :class="{ 'bg-[#DFCCAF] text-[#854442]': selectedUserId === '' }" @click="selectedUserId = ''">All</div>
            <div v-for="user in uniqueUserIds" :key="user" class="p-1 rounded leading-none cursor-pointer" :class="{ 'bg-[#DFCCAF] text-[#854442]': selectedUserId === user }" @click="selectedUserId = user">
                {{ user.split(" ")[0] }}
            </div>
        </div>
    </div>

    <!-- Navigation Menus -->
    <div v-if="allowedUser.includes(userId)" class="fixed w-full bottom-0 left-0 bg-[#854442] shadow-xl">
        <div class="relative w-full max-w-[600px] mx-auto">
            <div class="w-full flex items-center justify-around relative py-1">
                <div class="text-[#e5c593] text-center cursor-pointer" @click="scrolToTop()">
                    <Icon class="text-[20px] block mx-auto" name="ion:home" />
                    <p class="text-[10px] text-title">Home</p>
                </div>
                <div class="text-[#e5c593] text-center cursor-pointer" @click="showBudget = true">
                    <Icon class="text-[20px] block mx-auto" name="ion:cut-outline" />
                    <p class="text-[10px] text-title">Budgets</p>
                </div>
                <div class="w-[32px] h-[32px] rounded-full flex items-center justify-center scale-[1.6] translate-y-[-35%] bg-[#d18f27] rounded-full shadow-xl cursor-pointer" @click="showFormInputSpend = true">
                    <Icon class="text-[20px] block text-[#DFCCAF]" name="ion:plus-round" />
                </div>
                <div class="text-[#e5c593] text-center cursor-pointer" @click="showChart = true">
                    <Icon class="text-[20px] block mx-auto" name="ion:bar-chart-outline" />
                    <p class="text-[10px] text-title">Reports</p>
                </div>
                <div class="text-[#e5c593] text-center cursor-pointer" @click="refetchData(dateToDocsIdFormat); isLoading = true">
                    <Icon class="text-[20px] block mx-auto" name="ion:reload-outline" />
                    <p class="text-[10px] text-title">Reload</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Bottom Sheets -->
    <div v-if="allowedUser.includes(userId)" class="fixed bottom-0 left-0 rounded-t-xl bg-[#6F4436] max-h-[90vh] w-full shadow-md transition z-[101]" :class="[ showFormInputSpend ? 'translate-y-0' : 'translate-y-[120%]' ]">
        <div class="relative w-full px-4 pt-[32px] pb-[48px] h-[90vh]">
            <SpendingForm @newData="pushNewData" :categories="allCategories" :spendingData="filteredSpendingDataFix" />
            <div class="absolute right-[12px] top-[12px] cursor-pointer rounded-full bg-[#DFCCAF] z-[3]" @click="showFormInputSpend = false">
                <Icon class="text-[26px] block text-[#6F4436]" name="ion:ios-arrow-down" />
            </div>
        </div>
    </div>
    <div v-if="allowedUser.includes(userId)" class="fixed bottom-0 left-0 rounded-t-xl bg-[#6F4436] max-h-[90vh] w-full shadow-md transition z-[101]" :class="[ showBudget ? 'translate-y-0' : 'translate-y-[120%]' ]">
        <div class="relative w-full px-4 pt-[32px] pb-[48px] h-[90vh]">
            <SpendingBudget :categories="allCategories" @updateBudgetData="closeBudgetPanel" :spendingData="filteredSpendingDataFix" :panelIsShowed="showBudget" />
            <div class="absolute right-[12px] top-[12px] cursor-pointer rounded-full bg-[#DFCCAF] z-[3]" @click="showBudget = false">
                <Icon class="text-[26px] block text-[#6F4436]" name="ion:ios-arrow-down" />
            </div>
        </div>
    </div>
    <div class="fixed bottom-0 left-0 rounded-t-xl bg-[#6F4436] max-h-[90vh] w-full shadow-md transition" :class="[ showChart ? 'translate-y-0' : 'translate-y-[120%]' ]">
        <div class="relative w-full h-[90vh]">
            <div class="px-4 overflow-y-auto h-[90vh]">
                <SpendingPieChart v-if="showChart" :spendingDataByEmail="filteredSpendingDataFix" :spendingData="filteredSpendingData" :spendingMonth="formatYearMonth(monthChoosen)" class="pb-[64px]" />
            </div>
            <div class="absolute right-[12px] top-[12px] cursor-pointer rounded-full bg-[#DFCCAF] z-[3]" @click="showChart = false">
                <Icon class="text-[26px] block text-[#6F4436]" name="ion:ios-arrow-down" />
            </div>
        </div>
    </div>
</div>


<div v-if="showSuccess" class="fixed top-[30%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-[#EEFCD2] text-[#1e1e1e] text-xl rounded px-4 py-2 shadow-lg w-max">
    Success Add New Data
</div>
<!-- Loader -->
<transition name="fade">
<div v-if="!userId || isLoading" class="fixed top-0 left-0 w-full h-full bg-[#DFCCAF] flex items-center justify-center z-[200] text-[#4f2e23]">
    <div class="text-center text-2xl relative w-[100px] leading-none">
        <span class="font-bold block">GOL.DS</span>
        Loading<span class="animat"> . . .</span>
    </div>
</div>
</transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAsyncData } from '#app';
import VueDatePicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';

const spendingData = ref([]);
const selectedUserId = ref('');
const monthChoosen = ref(new Date());
const monthData = ref("")
const showFormInputSpend = ref(false);
const showChart = ref(false);
const showBudget = ref(false);
const showDelConf = ref(false);
const keyDelConf = ref();
const userId = ref(useState('userId'))
const isLoading = ref(false)
const showSuccess = ref(false);

const config = useRuntimeConfig();
const allowedUser = ref(JSON.parse(config.public.ALLOWED_USER));

const showDeleteConfirmation = (ky) => {
    showDelConf.value = true;
    keyDelConf.value = ky;
}


const closeBudgetPanel = () => {
    console.log("successs");
}

watch(showSuccess, () => {
  if(!showSuccess.value) return
  setTimeout(() => {
    showSuccess.value = false;
  }, 2500);
})

watch(monthChoosen, () => {
    monthData.value = `${monthChoosen?.value?.year}${String(monthChoosen?.value?.month+1).padStart(2, '0')}`;
    refetchData(monthData.value);
})

watch(isLoading, () => {
    if(isLoading.value) {
        setTimeout(() => {
            isLoading.value = false
        }, 500);
    }
})

const calculateTotalSpendingByDay = (data, day) => {
    return data.spendingData.reduce((total, item) => total + item.spending, 0);
};

const scrolToTop = () => {
    const spendList = document.getElementById('spendList')
    spendList.scrollTo({ top: 0, behavior: 'smooth' });
}

const deleteCard = async (id, day) => {
    const montAvail = monthData.value ? monthData.value : dateToDocsIdFormat.value;
    try {
        await useFetch('/api/spending-delete-id', {
        method: 'POST',
        body: {
            yearMonth: montAvail,
            day,
            spendingDataId: id
        },
        });
        refetchData(montAvail);
    } catch (error) {
        console.error('Error adding spending record: ', error);
    }
}

const formatCurrency = (str) => {
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const pushNewData = (ev) => {
    showFormInputSpend.value = false;
    setTimeout(() => {
        showSuccess.value = true;
        const date = new Date(ev.date);
        monthChoosen.value = {
            month: date.getMonth(),
            year: date.getFullYear()
        }
        monthData.value = `${monthChoosen?.value?.year}${String(monthChoosen?.value?.month+1).padStart(2, '0')}`;
        refetchData(monthData.value);
    }, 500);
}

const dateToDocsIdFormat = computed(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${year}${month}`;
})
const { data, error } = await useAsyncData('spendingData', () =>
    $fetch(`/api/spending-list`, {
        params: { data: dateToDocsIdFormat.value },
    })
);

if (error.value) {
    console.error('Error fetching spending data:', error.value);
} else {
    spendingData.value = data.value || [];
}

const uniqueUserIds = computed(() => {
    const userIds = new Set();
    spendingData.value.forEach(day => {
        day.spendingData.forEach(item => {
        userIds.add(item.userName);
        });
    });
    return Array.from(userIds);
});

const filteredSpendingData = computed(() => {
    if (!selectedUserId.value) {
        return spendingData.value;
    }
    return spendingData.value.map(day => {
        const filteredDay = { ...day };
        filteredDay.spendingData = day.spendingData.filter(item => item.userName === selectedUserId.value);
        return filteredDay;
    }).filter(day => day.spendingData.length > 0);
});

const filteredSpendingDataFix = computed(() => {
    return spendingData.value.map(day => {
        const filteredDay = { ...day };
        filteredDay.spendingData = day.spendingData.filter(item => item.userId === useState('userId')?.value);
        return filteredDay;
    }).filter(day => day.spendingData.length > 0);
});

const formatYearMonth = (yearMonthString) => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = yearMonthString.month ? monthNames[yearMonthString.month] : monthNames[new Date(yearMonthString).getMonth()];
    const year = yearMonthString.year ? yearMonthString.year : new Date(yearMonthString).getFullYear();

    return `${month} ${year}`;
}
const formatDateFirestore = (timestamp, showDate) => {
    const date = timestamp?._seconds ? new Date(timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000) : new Date(timestamp);
    let options = {}

    if (showDate) {
        options = { ...options, month: 'long' }
    }
    else {
        options = { ...options, hour: '2-digit', minute: '2-digit' }
    }

    const newDate = new Intl.DateTimeFormat('en-US', options).format(date)
    return newDate.replace(",", "");
}
const theCategories = useCategoriesRegist();
const allCategories = ref(theCategories.value);
const formatCategory = (cat) => {
    const arr = allCategories.value;
    return {
        label: arr.find(x => x.id === cat)?.label ?? "Other",
        icon: arr.find(x => x.id === cat)?.icon ?? "ion:cash-outline"
    }
}
const refetchData = async (dt) => {
    try {
        const data = await $fetch(`/api/spending-list`, {
            params: { data: dt },
        });
        spendingData.value = data;
        window.scrollTo({
            top: 0,
            behavior: 'smooth' // Optional: Adds a smooth scrolling effect
        });
        error.value = null; // Clear any previous errors
    } catch (err) {
        spendingData.value = null; // Clear previous data
        error.value = err;
    }
};

onMounted(() => {
    const theLS = localStorage.getItem("userDS")
    userId.value = theLS ? JSON.parse(theLS).userId : useState('userId')
})
</script>
      