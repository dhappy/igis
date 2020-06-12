export const genSeed = (length = 81) => {
  var chars        = '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // The allowed characters in the seed.
  var randomValues = new Uint32Array(length)        // An empty array to store the random values.
  var result       = new Array(length)              // An empty array to store the seed characters.

  window.crypto.getRandomValues(randomValues)       // Generate random values and store them to array.

  var cursor = 0                                    // A cursor is introduced to remove modulus bias.
  for (var i = 0; i < randomValues.length; i++) {   // Loop through each of the 81 random values.
      cursor += randomValues[i]                     // Add them to the cursor.
      result[i] = chars[cursor % chars.length]      // Assign a new character to the seed based on cursor mod 81.
  }

  return result.join('')                            // Merge the array into a single string and return it.
}