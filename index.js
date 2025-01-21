
function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function generateCalendar(startMonth, startYear, endMonth, endYear) {
    const calendarContainer = document.getElementById('calendarContainer');
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const holidays = {
        "2025-04-20": "Easter Sunday",
        "2025-05-24": "Memorial Day Weekend",
        "2025-05-25": "Memorial Day Weekend",
        "2025-05-26": "Memorial Day Weekend"
    };

    // Calculate the total number of weeks in the session
    const sessionStart = new Date(startYear, startMonth, 1);
    const sessionEnd = new Date(endYear, endMonth + 1, 0);
    const totalWeeks = Math.ceil((sessionEnd - sessionStart) / (7 * 24 * 60 * 60 * 1000)); // Weeks in session

    let remainingLessonsByDay = {
        Mon: totalWeeks,
        Tue: totalWeeks,
        Wed: totalWeeks,
        Thu: totalWeeks,
        Fri: totalWeeks,
        Sat: totalWeeks,
        Sun: totalWeeks
    };

    let globalWeekNumber = 1;

    for (let year = startYear; year <= endYear; year++) {
        for (let month = startMonth; month <= (year === endYear ? endMonth : 11); month++) {
            const daysInMonth = getDaysInMonth(year, month);
            let firstDay = new Date(year, month, 1).getDay();

            // Adjust the first day to make Monday the first day of the week
            firstDay = (firstDay === 0) ? 6 : firstDay - 1;

            const table = document.createElement('table');
            const caption = document.createElement('caption');
            caption.textContent = `${months[month]} ${year}`;
            table.appendChild(caption);

            // Create table header
            const headerRow = document.createElement('tr');

            // Add "Week" header
            const weekHeader = document.createElement('th');
            weekHeader.textContent = "Week";
            weekHeader.scope = "col";
            headerRow.appendChild(weekHeader);

            // Add day headers, starting with Monday
            const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            daysOfWeek.forEach(day => {
                const th = document.createElement('th');
                th.textContent = day;
                th.scope = "col";
                headerRow.appendChild(th);
            });
            table.appendChild(headerRow);

            let row = document.createElement('tr');

            // Add "Week" header for the first row
            const weekCell = document.createElement('th');
            weekCell.textContent = globalWeekNumber;
            weekCell.scope = "row";
            row.appendChild(weekCell);

            // Fill empty cells before the first day of the month
            for (let i = 0; i < firstDay; i++) {
                const emptyCell = document.createElement('td');
                emptyCell.className = 'empty';
                row.appendChild(emptyCell);
            }

            // Fill days of the month
            for (let day = 1; day <= daysInMonth; day++) {
                if (row.children.length === 8) { // 7 days + 1 week header
                    table.appendChild(row);
                    row = document.createElement('tr');

                    // Increment the global week number and add "Week" header for the new row
                    globalWeekNumber++;
                    const weekCell = document.createElement('th');
                    weekCell.textContent = globalWeekNumber;
                    weekCell.scope = "row";
                    row.appendChild(weekCell);
                }

                const cell = document.createElement('td');
                cell.textContent = day;

                const currentDate = new Date(year, month, day);
                const dayOfWeek = daysOfWeek[(firstDay + day - 1) % 7];
                const holidayKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

                // Check if the current date is a holiday
                let isHoliday = false;
                if (holidays[holidayKey]) {
                    isHoliday = true;

                    const holidayText = document.createElement('div');
                    holidayText.textContent = `School Closed - No Lessons (${holidays[holidayKey]})`;
                    holidayText.style.fontSize = '0.8em';
                    holidayText.style.color = 'red';
                    cell.appendChild(holidayText);
                }

                // Decrease the remaining lessons only if it’s not a holiday
                if (!isHoliday && remainingLessonsByDay[dayOfWeek] > 0) {
                    remainingLessonsByDay[dayOfWeek]--;
                }

                // Add lessons remaining text
                const lessonsText = document.createElement('div');
                lessonsText.textContent = `${remainingLessonsByDay[dayOfWeek]} classes`;
                lessonsText.style.fontSize = '0.85em';
                lessonsText.style.color = '#555';
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

            // Add the table to the container
            calendarContainer.appendChild(table);
        }
        startMonth = 0;
    }
}

// Generate calendar for April to June 2025
generateCalendar(3, 2025, 5, 2025);
