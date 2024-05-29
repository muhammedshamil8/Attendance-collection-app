const getStudentYear = (joinedYear: string): string => {
    const joinedYearInt = parseInt(joinedYear);
    const currentYear = new Date().getFullYear();
    const studentYear = currentYear - joinedYearInt + 1;
    let yearDescription = "";

    if (studentYear === 1) {
      yearDescription = "1st year";
    } else if (studentYear === 2) {
      yearDescription = "2nd year";
    } else if (studentYear === 3) {
      yearDescription = "3rd year";
    } else if (studentYear === 4) {
      yearDescription = "4th year";
    } else {
      yearDescription = `graduate`;
    }

    return `${yearDescription}`;
  }

  export default getStudentYear;