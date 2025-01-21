// Wait until the DOM is fully loaded (optional but good practice)
document.addEventListener("DOMContentLoaded", () => {

    /************************************************************
     * 1) HELPER FUNCTION: Get number of days in a given month
     ************************************************************/
    function getDaysInMonth(year, month) {
      // month is zero-based (0=Jan, 1=Feb, ... 11=Dec)
      return new Date(year, month + 1, 0).getDate();
    }
  
    /************************************************************
     * 2) HELPER FUNCTION: Calculate how many total lessons
     *    occur on each weekday between startDate and endDate,
     *    excluding holidays.
     ************************************************************/
    function calculateLessonsByDay(startDate, endDate, holidays) {

    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    console.log("Holidays:", holidays);

      // Track lessons for each day of the week
      const lessonsByDay = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][currentDate.getDay()];
        const dateKey = currentDate.toISOString().split("T")[0]; // e.g. "2025-04-01"
  
        // If not a holiday, increment the lesson count for this weekday
        if (!holidays[dateKey]) {
          lessonsByDay[dayOfWeek]++;
        }
  
        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      console.log(lessonsByDay);
      return lessonsByDay;
     
    }
  
    /************************************************************
     * 3) MAIN FUNCTION: Generate the multi-month calendar
     *    for the given date range (sessionStart to sessionEnd),
     *    marking holidays, "first class," "last class," etc.
     ************************************************************/
    function generateCalendar(sessionStart, sessionEnd, holidays) {
      // Grab the container where we'll inject the tables
      const calendarContainer = document.getElementById("calendarContainer");
  
      // Clear any old calendar
      calendarContainer.innerHTML = "";
  
      // Month names for display
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
  
      // 1) Calculate how many lessons per weekday (excluding holidays)
      const totalLessonsByDay = calculateLessonsByDay(sessionStart, sessionEnd, holidays);
      
      // 2) Initialize a "remaining lessons" count that will decrement as we fill the calendar
      let remainingLessonsByDay = { ...totalLessonsByDay };
      console.log(totalLessonsByDay);
      
      // 3) Identify the first and last class date for each weekday
      const firstClassByDay = { Mon: null, Tue: null, Wed: null, Thu: null, Fri: null, Sat: null, Sun: null };
      const lastClassByDay  = { Mon: null, Tue: null, Wed: null, Thu: null, Fri: null, Sat: null, Sun: null };
  
      for (let d = new Date(sessionStart); d <= sessionEnd; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
        const dateKey   = d.toISOString().split("T")[0];
  
        // If it's not a holiday
        if (!holidays[dateKey]) {
          if (!firstClassByDay[dayOfWeek]) {
            firstClassByDay[dayOfWeek] = new Date(d);
          }
          lastClassByDay[dayOfWeek] = new Date(d);
        }
        console.log(firstClassByDay), console.log(lastClassByDay);
      }
  
      // 4) We'll loop over each month from sessionStart to sessionEnd
      //    building a separate table for each month.
  
      let globalWeekNumber = 1; // keep track of "Week" column as we go
  
      // Calculate the starting year/month
      const startYear = sessionStart.getFullYear();
      const startMonth = sessionStart.getMonth();
      // Calculate the ending year/month
      const endYear = sessionEnd.getFullYear();
      const endMonth = sessionEnd.getMonth();
  
      // Loop over the years
      for (let year = startYear; year <= endYear; year++) {
        const monthBegin = (year === startYear) ? startMonth : 0;
        const monthFinal = (year === endYear)   ? endMonth   : 11;
    
        for (let month = monthBegin; month <= monthFinal; month++) {
          // 1) Compute the entire calendar range for this month
          const monthStartDate = new Date(year, month, 1);      // e.g., March 1
          const monthEndDate   = new Date(year, month + 1, 0);  // e.g., March 31
    
          // 2) **Key addition for Option C**: Skip months that don't intersect session range
          if (monthEndDate < sessionStart) {
            // The month is entirely before the sessionStart, so skip it
            continue;
          }
          if (monthStartDate > sessionEnd) {
            // The month is entirely after the sessionEnd, so skip it
            continue;
          }
          // Create a new table for this month
          const table = document.createElement("table");
  
          // Table caption with "Month Year"
          const caption = document.createElement("caption");
          caption.textContent = `${months[month]} ${year}`;
          table.appendChild(caption);
  
          // Table header row: "Week" + Mon-Sun
          const headerRow = document.createElement("tr");
  
          const weekHeader = document.createElement("th");
          weekHeader.textContent = "Week";
          headerRow.appendChild(weekHeader);
  
          // We'll represent daysOfWeek in Monday-first order
          const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
          daysOfWeek.forEach(day => {
            const th = document.createElement("th");
            th.textContent = day;
            headerRow.appendChild(th);
          });
  
          table.appendChild(headerRow);
  
          // Prepare row for the first week
          let row = document.createElement("tr");
          // "Week" cell
          const weekCell = document.createElement("th");
          weekCell.textContent = globalWeekNumber;
          row.appendChild(weekCell);
  
          // Determine how many days are in this month
          const daysInMonth = getDaysInMonth(year, month);
  
          // Determine the day of the week (Monday=0, ..., Sunday=6)
          // for the first day of this month
          const firstDayJS = new Date(year, month, 1).getDay(); // JS: 0=Sun, 1=Mon, ... 6=Sat
          // Convert so that Monday=0, Tuesday=1, ..., Sunday=6
          // If firstDayJS=0 (Sunday), we want index=6
          let firstDay = (firstDayJS === 0) ? 6 : (firstDayJS - 1);
  
          // Fill in empty cells before the 1st of the month (if the 1st doesn't fall on Monday)
          for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement("td");
            emptyCell.className = "empty";
            row.appendChild(emptyCell);
          }
  
          // Now loop through each date in the month
          for (let day = 1; day <= daysInMonth; day++) {
            // If row is filled (7 days + 1 "Week" cell = 8 cells), push it to table and start a new row
            if (row.children.length === 8) {
              table.appendChild(row);
  
              // New row
              row = document.createElement("tr");
              globalWeekNumber++;
              const newWeekCell = document.createElement("th");
              newWeekCell.textContent = globalWeekNumber;
              row.appendChild(newWeekCell);
            }
  
            // Create a cell for this date
            const cell = document.createElement("td");
            cell.textContent = day;
  
            // Construct a Date for this day
            const currentDate = new Date(year, month, day);
            // Day of the week in [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
            const dayOfWeek = daysOfWeek[(firstDay + (day - 1)) % 7];
  
            // Format date as YYYY-MM-DD for holiday checks
            const dateKey = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
  
            let isHoliday = false;
            if (holidays[dateKey]) {
              isHoliday = true;
            }
  
            // We'll create a small div to display the "lessons" info
            const lessonsText = document.createElement("div");
            lessonsText.style.fontSize = "0.8em";
  
            if (isHoliday) {
              lessonsText.textContent = `No Classes (${holidays[dateKey]})`;
              lessonsText.style.color = "red";
            } else {
              // If not a holiday, we check:
              if (
                firstClassByDay[dayOfWeek] &&
                currentDate.getTime() === firstClassByDay[dayOfWeek].getTime()
              ) {
                // It's the very first class for this weekday
                lessonsText.textContent = `${totalLessonsByDay[dayOfWeek]} classes`;
              } else if (
                lastClassByDay[dayOfWeek] &&
                currentDate.getTime() === lastClassByDay[dayOfWeek].getTime()
              ) {
                // It's the last class for this weekday
                lessonsText.textContent = `1 (Last) class`;
              } else if (
                lastClassByDay[dayOfWeek] &&
                currentDate < lastClassByDay[dayOfWeek]
              ) {
                // Decrement the remaining count for intermediate days
                lessonsText.textContent = `${remainingLessonsByDay[dayOfWeek]} classes`;
              
                // Only decrement after setting the text, to prevent off-by-one errors
                if (remainingLessonsByDay[dayOfWeek] > 1) {
                  remainingLessonsByDay[dayOfWeek]--;
                }
              } else {
                // If it's after the last class, or no class at all
                lessonsText.textContent = "";
              }
              
              
            }
  
            cell.appendChild(lessonsText);
            row.appendChild(cell);
          }
  
          // Fill any remaining cells in the final row to make a full week
          while (row.children.length < 8) {
            const emptyCell = document.createElement("td");
            emptyCell.className = "empty";
            row.appendChild(emptyCell);
          }
          table.appendChild(row);
  
          // Finally, add this month's table to the container
          calendarContainer.appendChild(table);
        }
      }
    }
  
    /************************************************************
     * 4) DYNAMIC HOLIDAY INPUTS
     ************************************************************/
    const holidayCountEl = document.getElementById("holidayCount");
    const holidayInputContainer = document.getElementById("holidayInputContainer");
  
    // When user changes the "How many holidays" number
    holidayCountEl.addEventListener("input", () => {
      holidayInputContainer.innerHTML = "";
  
      const numberOfHolidays = parseInt(holidayCountEl.value, 10);
      if (isNaN(numberOfHolidays) || numberOfHolidays <= 0) {
        // If invalid, just stop
        return;
      }
  
      // Generate holiday date/reason inputs
      for (let i = 1; i <= numberOfHolidays; i++) {
        const container = document.createElement("div");
        container.classList.add("holiday-container");
  
        // Date label + input
        const dateLabel = document.createElement("label");
        dateLabel.innerText = `Holiday #${i} Date: `;
        const dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.id = `holidayDate${i}`;
        dateInput.required = true;
  
        // Reason label + input
        const reasonLabel = document.createElement("label");
        reasonLabel.innerText = " Reason: ";
        const reasonInput = document.createElement("input");
        reasonInput.type = "text";
        reasonInput.id = `holidayReason${i}`;
        reasonInput.required = true;
        reasonInput.placeholder = "e.g., Christmas Day";
  
        // Assemble
        container.appendChild(dateLabel);
        container.appendChild(dateInput);
        container.appendChild(reasonLabel);
        container.appendChild(reasonInput);
  
        // Add to the main holiday container
        holidayInputContainer.appendChild(container);
      }
    });
  
    /************************************************************
     * 5) EVENT: "Generate Calendar" button
     ************************************************************/
    const updateCalendarBtn = document.getElementById("updateCalendar");
  
    updateCalendarBtn.addEventListener("click", () => {
          // Retrieve values from input fields
  const startDateStr = document.getElementById("startDate").value; // "YYYY-MM-DD"
  const endDateStr = document.getElementById("endDate").value;     // "YYYY-MM-DD"
      // 1) Parse user’s session start date & end date
   // Parse the input date manually and set local time to 12:00 to avoid time zone shifts
    const [startYear, startMonth, startDay] = startDateStr.split("-").map(Number);
    const sessionStart = new Date(startYear, startMonth - 1, startDay, 12);

    const [endYear, endMonth, endDay] = endDateStr.split("-").map(Number);
    const sessionEnd = new Date(endYear, endMonth - 1, endDay, 12);

      if (!startDateStr || !endDateStr) {
        alert("Please select both a start and end date.");
        return;
      }
  
    
  
      // Validate that start <= end
      if (sessionStart > sessionEnd) {
        alert("End date must be on or after the start date.");
        return;
      }
  
      // 2) Build up the holidays object
      const holidays = {};
      const numberOfHolidays = parseInt(holidayCountEl.value, 10) || 0;
      for (let i = 1; i <= numberOfHolidays; i++) {
        const dateInput = document.getElementById(`holidayDate${i}`);
        const reasonInput = document.getElementById(`holidayReason${i}`);
  
        if (dateInput && reasonInput) {
          const holidayDate = dateInput.value;   // e.g. "2025-04-20"
          const holidayReason = reasonInput.value;
          if (holidayDate) {
            holidays[holidayDate] = holidayReason;
          }
        }
      }
  
      // 3) Call our main function to generate the calendar
      generateCalendar(sessionStart, sessionEnd, holidays);
    });
  });
  