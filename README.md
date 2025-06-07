# Codex Config Tool

This prototype is an Electron-based desktop application for exploring configuration data.
It demonstrates loading an Excel tag list and a JSON scan file and visualising the devices
found on a loop.

## Features

- **Topology View** – graphical view of devices and their connections using React Flow.
- **Device List View** – merges information from the tag list and scan data.
- **C&E Editor** – placeholder for future cause and effect editing.

Sample files are provided in this repository:

- `tags.csv` – example list of detection zone tags.
- `raiseloop.json` – sample scanned device data.

## Running the App

1. Install dependencies using npm:
   ```bash
   npm install
   ```
2. Start the Electron application:
   ```bash
   npm start
   ```

The app window will open and you can load your own `.xlsx` tag list and `.json` scan data
using the file inputs in the sidebar.

## Requirements

- Node.js (v18 or later is recommended)

## License

This project is released under the MIT License. See [LICENSE](LICENSE) for details.
