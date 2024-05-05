<template>
  <div class="dbml-graph-wrapper">
    <v-db-chart v-if="schema && chart.loaded"
                v-bind="schema"
                @dblclick:table-group="locateInEditor"
                @dblclick:table="locateInEditor"
                @dblclick:field="locateInEditor"
                @dblclick:ref="locateInEditor"
     />

    <div class="dbml-structure-wrapper" v-if="false">
      <q-card class="shadow-6">
        <v-db-structure v-if="editor.database.schemas"
                        :database="editor.database"
        />
      </q-card>
    </div>

    <div class="dbml-toolbar-wrapper">
      <q-card class="shadow-6">
        <q-toolbar class="rounded-borders">
          <q-btn
            class="q-mr-xs q-px-md"
            color="secondary"
            dense
            @click="applyAutoLayout"
          >
            Auto-Layout
          </q-btn>
          <q-btn
            class="q-mx-xs q-px-md"
            color="secondary"
            dense
            @click="applyScaleToFit">
            fit
          </q-btn>
          <q-space/>

          <q-slider
            class="q-mx-sm"
            style="width: 25%; min-width: 100px; max-width: 200px;"
            v-model="scale"
            :min="minScale"
            :max="maxScale"
          />
          <div
            class="q-mx-sm non-selectable"
            style="width: 2.5rem; flex: 0 0 auto;">{{ Math.round(scale) }} %
          </div>

        </q-toolbar>
      </q-card>
    </div>
  </div>
</template>

<script setup>
  import { useEditorStore } from '../store/editor'
  import { computed, ref } from 'vue'
  import { useChartStore } from '../store/chart'
  import VDbChart from './VDbChart/VDbChart'
  import VDbStructure from './VDbStructure'

  const props = defineProps({
    schema: {
      type: Object,
      required: true
    }
  })

  const emit = defineEmits([
    'update:positions',
  ])
  const editor = useEditorStore()
  const chart = useChartStore()

  const locateInEditor = (e, thing) => {
    console.log("locateInEditor", e, thing);
    if (thing) {
      const token = thing.token
      editor.updateSelectionMarker(token.start, token.end)
    }
  }

  const scale = computed({
    get () {
      return (chart.zoom || 1) * 100.0
    },
    set (value) {
      chart.updateZoom(value / 100.0)
    }
  })

  const minScale = ref(10)
  const maxScale = ref(200)

  const applyAutoLayout = () => {
  const chartStore = useChartStore();
  
  // Log when the function starts execution
  console.log('applyAutoLayout function called');

  // Create a shallow copy to modify and replace
  const updatedTables = {...chartStore.tables};

  // Log the initial state of tables
  console.log('Initial table data:', updatedTables);

  let x = 0, y = 0;

  Object.entries(updatedTables).forEach(([tableId, table]) => {
    // Log the current table being processed
    console.log(`Updating table ${tableId}`, table);

    // Update the positions directly
    table.x = x;
    table.y = y;

    // Adjust the position for the next table based on its width
    x += table.width + 50; // Adjust the `50` spacing value as needed
    if (x >= window.innerWidth - table.width) {
      x = 0;
      y += table.height + 50; // Adjust vertical spacing
    }

    // Log the updated position for the table
    console.log(`Updated position for table ${tableId}:`, { x, y });
  });

  // Update the state and log the final state
  chartStore.$patch({ tables: updatedTables });
  console.log('Final updated table data:', updatedTables);
};

  const applyScaleToFit = () => {
    // do nothing
  };

</script>

<style scoped lang="scss">
  .dbml-graph, .db-chart {
    height: 100% !important;
    width: 100% !important;
  }

  .dbml-graph-wrapper {
    height: 100% !important;
    width: 100% !important;
    position: relative;
  }

  .dbml-toolbar-wrapper {
    width: 600px;
    align-self: center;
    position: absolute;
    bottom: 1rem;
    left: 0;
    right: 0;
    margin-left: auto;
    margin-right: auto;
  }

  .dbml-structure-wrapper {
    width: 400px;
    max-height: 300px;
    height: 300px;
    align-self: start;
    position: absolute;
    bottom: 1rem;
    left: 1rem;
    margin-right: auto;

    > .q-card {
      max-height: 300px;
      overflow: auto;
    }
  }
</style>
