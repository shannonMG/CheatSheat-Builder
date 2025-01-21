
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function calculateLessonsByDay(startDate, endDate, holidays) {
    const lessonsByDay = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };

    // Iterate through all dates in the range
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][currentDate.getDay()];
        const dateKey = currentDate.toISOString().split("T")[0]; // Format: "YYYY-MM-DD"

        // If the date is not a holiday, increment lessons for the corresponding day
        if (!holidays[dateKey]) {
            lessonsByDay[dayOfWeek]++;
        }

        // Move to the next day
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return lessonsByDay;
}

function generateCalendar(startMonth, startYear, endMonth, endYear) {
    // Get the container where the calendar tables will be added
    const calendarContainer = document.getElementById('calendarContainer');

    // List of month names for display purposes
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Object containing holiday dates and their descriptions
    const holidays = {
        "2025-04-20": "Easter Sunday",
        "2025-05-24": "Memorial Day Weekend",
        "2025-05-25": "Memorial Day Weekend",
        "2025-05-26": "Memorial Day Weekend"
    };

    // Calculate the total lessons for each weekday, excluding holidays
    const sessionStart = new Date(startYear, startMonth, 1); // Start of the session (first day of the start month)
    const sessionEnd = new Date(endYear, endMonth + 1, 0); // End of the session (last day of the end month)
    const totalLessonsByDay = calculateLessonsByDay(sessionStart, sessionEnd, holidays);

    // Initialize lesson counters for each weekday based on the calculated totals
    let remainingLessonsByDay = { ...totalLessonsByDay };

    // Track the first and last class dates for each weekday
    const firstClassByDay = { Mon: null, Tue: null, Wed: null, Thu: null, Fri: null, Sat: null, Sun: null };
    const lastClassByDay = { Mon: null, Tue: null, Wed: null, Thu: null, Fri: null, Sat: null, Sun: null };

    // Determine the first and last class dates for each weekday
    for (let date = new Date(sessionStart); date <= sessionEnd; date.setDate(date.getDate() + 1)) {
        // `date.getDay()` returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
        const dayOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];

        // Convert the date to a string in the format "YYYY-MM-DD" for comparison with holidays
        const dateKey = date.toISOString().split("T")[0];

        // If the date is not a holiday
        if (!holidays[dateKey]) {
            // Set the first class date for this weekday if not already set
            if (!firstClassByDay[dayOfWeek]) {
                firstClassByDay[dayOfWeek] = new Date(date);
            }

            // Continuously update the last class date for this weekday
            lastClassByDay[dayOfWeek] = new Date(date);
        }
    }

    let globalWeekNumber = 1; // Tracks the current week number across all months

    // Loop through each year and month in the specified range
    for (let year = startYear; year <= endYear; year++) {
        for (let month = startMonth; month <= (year === endYear ? endMonth : 11); month++) {
            // Get the total number of days in this month
            const daysInMonth = getDaysInMonth(year, month);

            // Determine the day of the week for the first day of this month
            let firstDay = new Date(year, month, 1).getDay(); // Returns 0 (Sunday) through 6 (Saturday)

            // Adjust so Monday is the first day of the week (0 = Monday, 6 = Sunday)
            firstDay = (firstDay === 0) ? 6 : firstDay - 1;

            // Create a new table element for this month's calendar
            const table = document.createElement('table');

            // Add a caption to the table with the month's name and year
            const caption = document.createElement('caption');
            caption.textContent = `${months[month]} ${year}`;
            table.appendChild(caption);

            // Create the header row with "Week" and weekday names
            const headerRow = document.createElement('tr');

            // Add the "Week" header cell
            const weekHeader = document.createElement('th');
            weekHeader.textContent = "Week";
            weekHeader.scope = "col";
            headerRow.appendChild(weekHeader);

            // Add headers for each day of the week
            const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            daysOfWeek.forEach(day => {
                const th = document.createElement('th');
                th.textContent = day;
                th.scope = "col";
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            // Create the first row in the table
            let row = document.createElement('tr');

            // Add the week number to the first cell of the row
            const weekCell = document.createElement('th');
            weekCell.textContent = globalWeekNumber;
            weekCell.scope = "row";
            row.appendChild(weekCell);

            // Fill empty cells before the first day of the month
            for (let i = 0; i < firstDay; i++) {
                const emptyCell = document.createElement('td');
                emptyCell.className = 'empty'; // Add a class for styling
                row.appendChild(emptyCell);
            }

            // Loop through each day in the month
            for (let day = 1; day <= daysInMonth; day++) {
                if (row.children.length === 8) { // Each row contains 7 days + 1 week header
                    table.appendChild(row); // Add the completed row to the table
                    row = document.createElement('tr'); // Start a new row

                    // Increment the week number and add it to the new row
                    globalWeekNumber++;
                    const weekCell = document.createElement('th');
                    weekCell.textContent = globalWeekNumber;
                    weekCell.scope = "row";
                    row.appendChild(weekCell);
                }

                // Create a new cell for the current day
                const cell = document.createElement('td');
                cell.textContent = day;

                // Create the current date object
                const currentDate = new Date(year, month, day);

                // Get the day of the week (e.g., "Mon", "Tue")
                const dayOfWeek = daysOfWeek[(firstDay + day - 1) % 7];

                // Convert the date to a string in "YYYY-MM-DD" format
                const holidayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                // Check if the current date is a holiday
                let isHoliday = false;
                if (holidays[holidayKey]) {
                    isHoliday = true;

                    // Add holiday text to the cell
                    const holidayText = document.createElement('div');
                    // holidayText.textContent = `School Closed - No Lessons (${holidays[holidayKey]})`;
                    holidayText.style.fontSize = '0.8em';
                    holidayText.style.color = 'red';
                    cell.appendChild(holidayText);
                }

                // Add lessons remaining text for valid class days
                const lessonsText = document.createElement('div');
                if (isHoliday) {
                    lessonsText.textContent = `No Classes`;
                } else if (currentDate.getTime() === firstClassByDay[dayOfWeek]?.getTime()) {
                    lessonsText.textContent = `${totalLessonsByDay[dayOfWeek]} classes`; // First class
                } else if (currentDate.getTime() === lastClassByDay[dayOfWeek]?.getTime()) {
                    lessonsText.textContent = `1 class (Last Class)`; // Last class
                } else if (currentDate < lastClassByDay[dayOfWeek]) {
                    remainingLessonsByDay[dayOfWeek]--;
                    lessonsText.textContent = `${remainingLessonsByDay[dayOfWeek]} classes`; // Decrement normally
                } else {
                    lessonsText.textContent = ``; // No lessons after the last class
                }
                lessonsText.style.fontSize = '0.85em';
                lessonsText.style.color = isHoliday ? 'red' : '#555';
                cell.appendChild(lessonsText);

                row.appendChild(cell);
            }

            // Fill remaining empty cells in the last row
            while (row.children.length < 8) {
                const emptyCell = document.createElement('td');
                emptyCell.className = 'empty';
                row.appendChild(emptyCell);
            }
            table.appendChild(row);

            // Add the completed table to the container
            calendarContainer.appendChild(table);
        }
        startMonth = 0; // Reset the start month to January after the first year
    }
}

// Generate calendar for April to June 2025
generateCalendar(3, 2025, 5, 2025);


// Attach the oninput event listener to the numLessons element
const numLessons = document.getElementById("numLessons"); // Ensure this exists in your HTML
const classInputsContainer = document.getElementById("classInputsContainer"); // Ensure this exists in your HTML
const holidayInputContainer = document.getElementById("holidayInputContainer"); // Correct variable name

holidayCount.oninput = function () {
    // Clear previous inputs
    holidayInputContainer.innerHTML = "";

    // Parse the number of holidays from the input field
    const numberOfHolidays = parseInt(holidayCount.value, 10);

    // Validate the input value
    if (isNaN(numberOfHolidays) || numberOfHolidays <= 0) {
        holidayInputContainer.innerHTML = "<p>Please enter a valid number of holidays.</p>";
        return;
    }

    // Loop to create holiday input fields based on the number of holidays
    for (let i = 1; i <= numberOfHolidays; i++) {
        // Create a container for each holiday
        const container = document.createElement("div");
        container.classList.add("holiday-container");

        // Add "What date is the holiday?" input
        const dateLabel = document.createElement("label");
        dateLabel.innerText = `What date is the holiday ${i}? `;
        const dateInput = document.createElement("input");
        dateInput.type = "date";
        dateInput.id = `holidayDate${i}`;
        dateInput.required = true;

        // Add "What is the reason for this holiday?" input
        const holidayLabel = document.createElement("label");
        holidayLabel.innerText = "What is the reason for this holiday";
        const holidayInput = document.createElement("input");
        holidayInput.type = "text";
        holidayInput.id = `holidayReason${i}`;
        holidayInput.required = true;
        holidayInput.placeholder = "e.g., Christmas Day";
        // Create a line break
        const lineBreak = document.createElement("br");

        // Append all elements to the container
        container.appendChild(dateLabel);
        container.appendChild(dateInput);
        container.appendChild(document.createElement("br")); // Add line break
        container.appendChild(holidayLabel);
        container.appendChild(holidayInput);

        // Add the container to the class inputs container
        holidayInputContainer.appendChild(container);
    }
};
