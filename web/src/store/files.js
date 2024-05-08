import { defineStore } from "pinia";
import { useEditorStore } from "src/store/editor";
import { useChartStore } from "src/store/chart";
import { saveAs } from 'file-saver'; // Add the file-saver library if not already included
import localforage from "localforage";

const fs = localforage.createInstance({
  name: "dbdiagram-oss",
  storeName: "files"
});

export const useFilesStore = defineStore("files", {
  state: () => ({
    saving: false,
    lastSave: 0,
    currentFile: "",
    files: []
  }),
  getters: {
    getFiles(state) {
      return state.files;
    },
    getCurrentFile(state) {
      return state.currentFile;
    }
  },
  actions: {
    loadFileList() {
      console.log("loading file list");

      fs.keys()
        .then(keys => {
          this.files = keys;
        });
    },
    loadFile(fileName) {
      this.loadFileList();
      console.log("loading file", fileName);

      fs.getItem(fileName)
        .then(file => {
          if (file && file.source) {
            const fSource = file.source;
            const fChart = file.chart || {};

            const editor = useEditorStore();
            const chart = useChartStore();

            chart.load(fChart);
            editor.load({
              source: fSource
            });

            this.$patch({
              currentFile: fileName
            });

          }
        });
    },
    saveFile(fileName) {
      this.saving = true;
      if (!fileName) {
        fileName = this.currentFile;
      }
      if (!fileName) {
        const list = this.files;
        let i = 1;
        fileName = `Untitled (${i})`;

        while (list.indexOf(fileName) >= 0) {
          fileName = `Untitled (${i++})`;
        }
      }
      console.log("saving file", fileName);

      const editor = useEditorStore();
      const chart = useChartStore();

      const file = {
        ...editor.save,
        chart: chart.save
      };

      fs.setItem(fileName, JSON.parse(JSON.stringify(file))).then(() => {
        this.loadFileList();
        this.saving = false;
        this.lastSave = new Date();
        if (this.currentFile !== fileName) {
          this.$patch({
            currentFile: fileName
          });
        }
      });
    },
    newFile() {
      this.$patch({
        currentFile: undefined
      });

      const editor = useEditorStore();
      const chart = useChartStore();

      editor.$reset();
      chart.$reset();
      this.saveFile();
    },
    deleteFile(fileName) {
      if (!fileName) return;
      fs.removeItem(fileName).then(() => {
        this.loadFileList();
      });
    },
    renameFile(newName) {
      const oldName = this.currentFile;
      this.saveFile(newName);
      if (oldName !== newName) {
        this.deleteFile(oldName);
        this.currentFile = newName;
      }
      this.loadFileList();
    },

    // New Function: Export files to JSON
    exportToJson() {
      fs.keys()
        .then(keys => {
          const promises = keys.map(key => fs.getItem(key));
          return Promise.all(promises);
        })
        .then(files => {
          const json = JSON.stringify(files, null, 2); // Pretty-print JSON
          const blob = new Blob([json], { type: "application/json" });
          saveAs(blob, 'dbdiagram-export.json'); // Download the JSON file
        })
        .catch(error => console.error('Export error:', error));
    },

    // New Function: Import files from JSON
    importFromJson(jsonData) {
      const files = JSON.parse(jsonData);

      files.forEach(file => {
        fs.setItem(file.id || `file-${Date.now()}`, file) // Generate a new ID if missing
          .catch(error => console.error('Import error:', error));
      });

      this.loadFileList(); // Refresh file list
    }
  }
});
