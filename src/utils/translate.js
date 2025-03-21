import axios from "axios";

/**
 * Translates text using Google Translate's unofficial API.
 * @param {string} text - The text to translate.
 * @param {string} targetLang - The target language code (e.g., "fr" for French).
 * @returns {Promise<string>} - The translated text.
 */
export const translateText = async (text, targetLang = "fr") => {
  try {
    const response = await axios.get(
      `https://translate.googleapis.com/translate_a/single`,
      {
        params: {
          client: "gtx", // Free client
          sl: "en", // Source language (English)
          tl: targetLang, // Target language (French by default)
          dt: "t",
          q: text,
        },
      }
    );

    console.log('response',response)
    return response.data[0][0][0]; // Extract the translated text
  } catch (error) {
    console.error("Translation Error:", error);
    return text; // Return original text on error
  }
};
