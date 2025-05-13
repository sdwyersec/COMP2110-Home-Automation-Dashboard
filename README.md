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

## Features
### Shopping List Widget
A shopping-list-widget that lets logged-in users view, add, and delete items from a shared shopping list. The list updates automatically when the widget loads and whenever changes are made, keeping everything in sync.
### Weather Widget
A weather-widget that displays real-time weather data based on the user's geolocation using the Open-Meteo API. It shows current temperature, wind speed, and location. The page may have to be reloaded for the data to be presented. Data from the outside temperature sensor may be added soon.
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
