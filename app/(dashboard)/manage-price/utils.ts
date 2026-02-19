export const getDaysInMonth = (month: string, year: number): number => {
  const monthIndex = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ].indexOf(month);

  return new Date(year, monthIndex, 0).getDate();
};
