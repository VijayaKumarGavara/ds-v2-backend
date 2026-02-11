function getAgriYear() {
  const d = new Date();
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-based

  const agri_year= month >= 5
    ? `${year}-${String(year + 1)}`
    : `${year - 1}-${String(year)}`;

    return agri_year;
}

module.exports=getAgriYear;