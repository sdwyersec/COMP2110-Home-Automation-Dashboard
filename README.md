# COMP2110 Portal - Starter

This is the starter repository for the COMP2110 Portal front end assignment 2023. You are
expected to customise this README file to describe your own project.  You should update this
file with some documentation on your group's implementation.

## Project Overview
This project is a modular home automation dashboard for COMP2110. It integrates various widgets that allow users to manage shopping lists, view weather data, control devices/sensors, and track tasks. Each widget communicates with a backend via APIs.

## Group Members 
| Name | Student ID | Contribution |
|----------|----------|----------|
|Simon Dwyer|48410543|Shopping list widget, weather widget, page styling, carousel feature|
|Kartik Malik|47963387|Todo list widget|
|Anwar Charif|47667915|Device controller widget|
|Yug Solanki|48076031|Device sensor controller widget, home overview widget|

## Features
### Shopping List Widget
A shopping-list-widget that lets logged-in users view, add, and delete items from a shopping list. The list updates automatically when the widget loads and whenever changes are made, keeping everything in sync.
### Weather Widget
A weather-widget that displays real-time weather data based on the user's geolocation using the Open-Meteo API. It shows current temperature, wind speed, and location. The page may have to be reloaded for the data to be presented. Data from the outside temperature sensor may be added soon.
### Todo List Widget
A todo-widget that allows users to manage a personal to-do list with real-time sync to a backend server. Tasks are saved locally using localStorage and synced with the server when the user is logged in. Users can add, check off, or delete tasks while logged out. The widget loads any stored tasks and handles offline syncing through a queue of pending actions.
### Device Controller Widget
A device-controller that displays the current status of a specific smart device and allows the user to toggle it on or off. It fetches device data from the server using the device ID and updates the status with an API call. The user must be logged in to interact with the device.
### Device Sensor Control Widget 
A device-sensor-control-widget that allows users to create new smart devices or sensors by submitting a form. It supports both device and sensor creation with customisable labels, types, and location IDs. The form sends data to the backend using an API call. Displays success or error messages based on server response. Requires valid login token to function properly.
### Home Overview Widget
A home-overview-widget that displays all smart devices and sensors grouped by location. It fetches data from the server and organises items into lists based on their assigned location. Useful for quickly visualising the state of a smart home setup in one view.
### UI Design + Carousel
Modern glassmorphic UI with a responsive layout. It includes a smooth sliding carousel that allows users to navigate between different widget panels using left and right arrows.

## Testing Instructions (for future developers)
To manually test widgets:
### Shopping List Widget: 
- Add, delete, check off, and update the quantity of items.
- Confirm that all changes persist after refreshing the page.
- Enter a long item name and verify the layout remains stable (no stretching).
- Add four or more items and ensure a vertical scrollbar appears without altering the widget's overall size.
- Attempt to add or delete items while logged out. Confirm that this is not possible. 

### Weather Widget:
- Ensure location access is enabled in your browser.
- Upon loading the page, verify that the widget displays:
  - Location coordinates  
  - Current temperature  
  - Wind speed
- Reload the page and confirm the weather data loads consistently.

### Todo List Widget:
- Add, delete, check off, and update tasks.
- Confirm that all changes persist after refreshing the page.
- Add five or more tasks and ensure a vertical scrollbar appears without altering the widget's overall size.
- Attempt to add or delete tasks while logged out. Confirm that this is not possible. 

### Device Controller Widget:

### Home Overview Widget:

### Carousel:
- Use the left and right arrow buttons to navigate between widget pages. Confirm that panels slide smoothly with animation.
- Confirm the carousel loops correctly (e.g., clicking right on the last panel returns to the first, and vice versa).

## Known Issues (for future developers)
- Weather widget will not load unless the page is refreshed after login due to geolocation permissions
- Width of todo list widget will increase when a long task is input (not exactly an issue but would be nicer if the widget size was consistent :/)
- The popup notification triggered when a logged-out user attempts to add or delete items from the shopping list or todo list does not appear
- Glassmorphic panel styling bleeds beyond the top and bottom edges of the widget container, affecting overall aesthetic appeal

## Future Improvements (outside scope of assignment, for future developers :3)
- Add customisation settings for user preferences for widget order and theme 
- Combine sensor data with weather widget 
- Sync todo list widget with google calendar 
- Pop-up alerts for reminders or sensor anomalies 
- Voice command support 
- Improve accessibility such as options to increase colour contrast and keyboard-only navigation

---
### 🔐 Authentication Integration

## Installation

The project has no external dependencies, it uses Lit via a CDN load directly into
the HTML page.   Node is used only to run a local HTTP server.

```bash
npm install
```

Will install the `http-server` node module.

```bash
npm start
```

will run the server.

## Assignment

Details about the assignment and back-end server are provided in [this document](Assignment.md).
