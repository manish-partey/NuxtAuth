<template>
  <div class="p-6 bg-white rounded-lg shadow">
    <h3 class="text-lg font-bold mb-4">Vue Learning: Simple Counter</h3>
    
    <!-- Display current count -->
    <p class="text-2xl mb-4">Count: {{ count }}</p>
    
    <!-- Buttons with event handlers -->
    <div class="space-x-2">
      <button 
        @click="increment" 
        class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        +1
      </button>
      
      <button 
        @click="decrement" 
        class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
      >
        -1
      </button>
      
      <button 
        @click="reset" 
        class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
      >
        Reset
      </button>
    </div>
    
    <!-- Conditional rendering -->
    <div class="mt-4">
      <p v-if="count > 0" class="text-green-600">Positive number!</p>
      <p v-else-if="count < 0" class="text-red-600">Negative number!</p>
      <p v-else class="text-gray-600">Zero!</p>
    </div>
    
    <!-- Computed property -->
    <p class="mt-2 text-sm text-gray-500">
      Double count: {{ doubleCount }}
    </p>
    
    <!-- List rendering -->
    <div class="mt-4">
      <h4 class="font-medium">Recent actions:</h4>
      <ul class="list-disc list-inside">
        <li v-for="action in recentActions" :key="action.id" class="text-sm">
          {{ action.text }} at {{ action.time }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Reactive data
const count = ref(0);
const recentActions = ref<Array<{id: number, text: string, time: string}>>([]);

// Computed property
const doubleCount = computed(() => count.value * 2);

// Helper function to add action
const addAction = (text: string) => {
  const action = {
    id: Date.now(),
    text,
    time: new Date().toLocaleTimeString()
  };
  recentActions.value.unshift(action);
  
  // Keep only last 5 actions
  if (recentActions.value.length > 5) {
    recentActions.value.pop();
  }
};

// Methods
const increment = () => {
  count.value++;
  addAction('Incremented');
};

const decrement = () => {
  count.value--;
  addAction('Decremented');
};

const reset = () => {
  count.value = 0;
  addAction('Reset');
};
</script>