# COMP2110 Portal - Starter

This is the starter repository for the COMP2110 Portal front end assignment 2023. You are
expected to customise this README file to describe your own project.  You should update this
file with some documentation on your group's implementation.

## Group Members 
| Name | Student ID | Contribution |
|----------|----------|----------|
|Simon Dwyer|48410543|Shopping list widget|
|Kartik Malik|47963387|Weather widget|

## Features
### Shopping List Widget
A `<shopping-list-widget>` that interacts with a shared list backend. Authenticated users can add or delete items from a designated "Shopping List". The widget fetches the list data on load, displays items, and provides real-time interaction with the server.
#

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
