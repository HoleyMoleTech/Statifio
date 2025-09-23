// Execute the data population script
console.log("🎯 Executing Statifio Database Population...")

// Import and run the population script
import("./populate-initial-data.js")
  .then(() => {
    console.log("✅ Population script execution completed")
  })
  .catch((error) => {
    console.error("❌ Population script failed:", error)
  })
