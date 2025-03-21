# SNGS - UI

SNGS - UI is a tool designed to visualize gamestate reconstruction tracklets. It provides features to display bounding boxes and tracking lines, with the ability to toggle visibility and compare between ground truth and prediction.

## Features
- Visualize bounding boxes and tracking lines for each tracklet.
- Toggle visibility of bounding boxes and tracking lines as needed.
- Compare between ground truth and prediction for better analysis.

## Installation

### Step 1: Install NVM (Node Version Manager)
To install NVM, follow these steps:

#### **For Linux/macOS:**
1. Open a terminal.
2. Run the following command:
   ```sh
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
   ```
3. Restart your terminal or run:
   ```sh
   source ~/.bashrc
   ```
4. Verify installation by running:
   ```sh
   nvm --version
   ```
5. Install the Node:
   ```sh
   nvm install --lts
   ```
6. Verify Node installation by running:
   ```sh
   node -v
   ```

#### **For Windows:**
1. Download the [NVM for Windows](https://github.com/coreybutler/nvm-windows/releases) installer.
2. Run the installer and follow the setup instructions.
3. Restart your terminal and check the installation with:
   ```sh
   nvm version
   ```

### Step 2: Clone the Project
Clone the repository using Git:
```sh
git clone <repository_url>
cd sngs-ui
```

### Step 3: Install Dependencies
Run the following command to install the required dependencies:
```sh
npm install
```

## Running the Project
To start the development server, run:
```sh
npm run dev
```

By default, the application will be accessible at:
```
http://localhost:3000
```

## Adding Tracklet Files
To visualize the tracklet data, you need to prepare and organize the files in the following structure:

```
tracklet_data/
│── original_frame/        # Folder containing all frame images
│── labels-gt.json         # Ground truth tracklet file
│── track-data.txt         # Prediction tracklet file
│── court-track-data.txt   # Court prediction tracklet file
```

### Steps to Add Tracklet Files:
1. Create a folder (e.g., `tracklet_data/`).
2. Inside this folder, create a subfolder `original_frame/` and put all the frame images there.
3. Place the following files inside `tracklet_data/`:
   - `labels-gt.json`: Contains the ground truth tracklet data.
   - `track-data.txt`: Contains the predicted tracklet data.
   - `court-track-data.txt`: Contains the court prediction tracklet data.
4. put the `tracklet_data` folder inside folder `public/data/`

Make sure the file names match exactly as shown above to ensure compatibility with the visualization tool.

## Contributing
Feel free to fork this project, submit issues, and contribute to its development.

## License
This project is licensed under [MIT License](LICENSE).

---

Enjoy using **SNGS - UI**!

