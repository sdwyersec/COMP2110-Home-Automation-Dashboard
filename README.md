# COMP2110 Portal - Starter

This is the starter repository for the COMP2110 Portal front end assignment 2023. You are
expected to customise this README file to describe your own project.  You should update this
file with some documentation on your group's implementation.

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
