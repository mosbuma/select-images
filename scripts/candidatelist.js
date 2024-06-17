const fs = require("fs");

// Directory containing the images
// const directoryPath = path.join(__dirname, "./public/images/nft-candidates");
const directoryPath =
  "/storage/devilsshare/select-images/public/images/nft-candidates";

// Regular expression to match and extract the index from the filenames
const regex = /^nft-(\d+)\.jpg$/;

// Read the directory and filter out only filenames matching the desired pattern
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error("Unable to read directory:", err);
    return;
  }

  // Create an array of objects with the original filenames and the extracted index
  const indexedFiles = files
    .map((file) => {
      const match = file.match(regex);
      if (match) {
        return {
          index: parseInt(match[1], 10), // Extracted index as an integer
          name: file, // Original filename
        };
      }
      return null;
    })
    .filter(Boolean); // Remove null values (non-matching filenames)

  // Sort the array based on the extracted index
  indexedFiles.sort((a, b) => a.index - b.index);

  // Extract the sorted filenames into a new array
  const sortedFiles = indexedFiles.map((file) => file.name);

  // Output the sorted filenames array
  console.log("export const nftimages = %s", JSON.stringify(sortedFiles, 0, 2));
});
