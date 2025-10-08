const logJSON = (label, data) => {
  console.log(`\n🟩 ${label}:`);

  if (!data) {
    console.log("⚠️ No data provided.");
    return;
  }

  if (typeof data === "object") {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(data);
  }

  console.log("──────────────────────────────\n");
};

module.exports = logJSON; 