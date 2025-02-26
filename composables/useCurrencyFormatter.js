export const useCurrencyFormatter = () => {
    const formatCurrency = (value) => {
      if (typeof value !== 'number') {
        return '';
      }
      return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
      }).format(value).replace('Rp', 'Rp ').replace(/,/, '.');
    };
  
    return {
      formatCurrency,
    };
};