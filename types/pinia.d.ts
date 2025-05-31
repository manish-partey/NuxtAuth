// types/pinia.d.ts
// import { Pinia } from 'pinia'; // OLD
import type { Pinia } from 'pinia'; // NEW: Add 'type' keyword

declare module '#app' {
  interface NuxtApp {
    $pinia: Pinia;
  }
}