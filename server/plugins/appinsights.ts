// server/plugins/appinsights.ts
import { defineNitroPlugin, useRuntimeConfig } from '#imports';
import appInsights from 'applicationinsights';

export default defineNitroPlugin(() => {
  const config = useRuntimeConfig();

  if (config.appInsightsKey) {
    appInsights.setup(config.appInsightsKey)
      .setAutoDependencyCorrelation(true)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true, true)
      .setUseDiskRetryCaching(true)
      .start();

    appInsights.defaultClient.context.tags[appInsights.defaultClient.context.keys.cloudRole] = 'NuxtBackend';
    console.log('✅ Application Insights initialized');
  } else {
    console.warn('⚠️ APPINSIGHTS_INSTRUMENTATIONKEY not provided');
  }
});
